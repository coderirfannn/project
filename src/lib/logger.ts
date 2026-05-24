type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, context?: LogContext): void {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const formatted = JSON.stringify(payload);

  if (level === 'error') {
    console.error(formatted);
    return;
  }

  if (level === 'warn') {
    console.warn(formatted);
    return;
  }

  console.log(formatted);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      writeLog('debug', message, context);
    }
  },
  info(message: string, context?: LogContext) {
    writeLog('info', message, context);
  },
  warn(message: string, context?: LogContext) {
    writeLog('warn', message, context);
  },
  error(message: string, context?: LogContext) {
    writeLog('error', message, context);
  },
};
