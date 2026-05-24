import { MAX_EXPIRY_RELEASE_BATCH } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { connectToDatabase, withMongoTransaction } from '@/lib/mongodb';
import { releaseInventoryReservation } from '@/repositories/inventory.repository';
import {
  listExpiredPendingReservations,
  releaseExpiredReservationRecord,
} from '@/repositories/reservation.repository';

export type ExpiryCleanupResult = {
  scannedCount: number;
  releasedCount: number;
  skippedCount: number;
  batchCount: number;
  exhausted: boolean;
};

export async function releaseExpiredReservations(
  batchSize = MAX_EXPIRY_RELEASE_BATCH,
  maxBatches = 10,
): Promise<ExpiryCleanupResult> {
  await connectToDatabase();

  let releasedCount = 0;
  let skippedCount = 0;
  let scannedCount = 0;
  let batchCount = 0;
  let exhausted = true;

  logger.info('Starting expired reservation cleanup', {
    batchSize,
    maxBatches,
  });

  while (batchCount < maxBatches) {
    batchCount += 1;
    const expiredReservations = await listExpiredPendingReservations(batchSize);
    scannedCount += expiredReservations.length;

    if (expiredReservations.length === 0) {
      logger.info('Expired reservation cleanup batch empty', { batchCount });
      break;
    }

    logger.info('Processing expired reservation batch', {
      batchCount,
      batchSize,
      reservationsInBatch: expiredReservations.length,
    });

    for (const reservation of expiredReservations) {
      const wasReleased = await withMongoTransaction(async (session) => {
        const updatedReservation = await releaseExpiredReservationRecord(session, reservation._id);

        if (!updatedReservation) {
          return false;
        }

        const restoredInventory = await releaseInventoryReservation(
          session,
          updatedReservation.sku,
          updatedReservation.quantity,
        );

        if (!restoredInventory) {
          throw new Error('Inventory release failed while expiring a reservation');
        }

        return true;
      });

      if (wasReleased) {
        releasedCount += 1;
      } else {
        skippedCount += 1;
      }
    }

    if (expiredReservations.length < batchSize) {
      logger.info('Expired reservation cleanup reached final partial batch', {
        batchCount,
        releasedCount,
        skippedCount,
      });
      break;
    }
  }

  if (batchCount >= maxBatches) {
    exhausted = false;
    logger.warn('Expired reservation cleanup stopped at max batch limit', {
      batchCount,
      maxBatches,
      releasedCount,
      skippedCount,
    });
  }

  logger.info('Expired reservation cleanup finished', {
    batchCount,
    scannedCount,
    releasedCount,
    skippedCount,
    exhausted,
  });

  return {
    scannedCount,
    releasedCount,
    skippedCount,
    batchCount,
    exhausted,
  };
}
