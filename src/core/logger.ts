import winston from 'winston';
import { NodeEnv } from './enums.js';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(meta).length) {
    log += ` ${JSON.stringify(meta)}`;
  }

  return log;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(),
  ),
  defaultMeta: { service: 'test' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== NodeEnv.PROD) {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),
  );
}

export default logger;
