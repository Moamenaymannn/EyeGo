const winston = require('winston');
const config = require('../../../config');

const logFormat = winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            const base = `${timestamp} [${level.toUpperCase()}] ${message}`;
            return stack ? `${base}\n${stack}` : base;
          }),
);

const logger = winston.createLogger({
          level: 'debug',
          format: logFormat,
          transports: [
                    new winston.transports.Console(),
          ],
});

module.exports = logger;
