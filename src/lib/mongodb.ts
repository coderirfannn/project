import mongoose, { type ClientSession } from 'mongoose';
import { getEnv } from '@/lib/env';
import { ServiceUnavailableError } from '@/lib/errors';
import { logger } from '@/lib/logger';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const defaultConnectionOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

function getConnectionCache(): MongooseCache {
  if (!globalForMongoose.mongooseCache) {
    globalForMongoose.mongooseCache = {
      conn: null,
      promise: null,
    };
  }

  return globalForMongoose.mongooseCache;
}

function getMongoUri(): string {
  try {
    return getEnv().MONGODB_URI;
  } catch (error) {
    logger.warn('MongoDB configuration is invalid', {
      error: error instanceof Error ? error.message : 'Unknown configuration error',
    });

    throw new ServiceUnavailableError('MongoDB connection configuration is missing or invalid', 'MONGODB_CONFIGURATION_ERROR');
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const cache = getConnectionCache();

  if (cache.conn) {
    logger.debug('Reusing cached MongoDB connection');
    return cache.conn;
  }

  if (!cache.promise) {
    const mongoUri = getMongoUri();

    logger.info('Creating MongoDB connection promise', {
      host: new URL(mongoUri).host,
      nodeEnv: process.env.NODE_ENV,
    });

    cache.promise = mongoose.connect(mongoUri, defaultConnectionOptions);
  } else {
    logger.debug('Awaiting in-flight MongoDB connection promise');
  }

  try {
    cache.conn = await cache.promise;
    logger.info('MongoDB connected successfully', {
      readyState: cache.conn.connection.readyState,
      name: cache.conn.connection.name,
      host: cache.conn.connection.host,
    });
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;

    logger.warn('MongoDB connection failed', {
      error: error instanceof Error ? error.message : 'Unknown connection error',
    });

    throw new ServiceUnavailableError('Failed to connect to MongoDB', 'MONGODB_CONNECTION_FAILED', {
      cause: error instanceof Error ? error.message : error,
    });
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  const cache = getConnectionCache();

  if (cache.promise) {
    await cache.promise.catch(() => undefined);
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  cache.conn = null;
  cache.promise = null;

  logger.info('MongoDB disconnected');
}

export async function withMongoTransaction<T>(executor: (session: ClientSession) => Promise<T>): Promise<T> {
  const connection = await connectToDatabase();
  const session = await connection.startSession();

  try {
    let result: T | undefined;

    await session.withTransaction(async () => {
      result = await executor(session);
    });

    return result as T;
  } catch (error) {
    logger.error('MongoDB transaction failed', {
      error: error instanceof Error ? error.message : 'Unknown transaction error',
    });

    throw error;
  } finally {
    await session.endSession();
  }
}
