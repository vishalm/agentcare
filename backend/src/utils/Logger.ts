import winston from "winston";

/**
 * Logger utility for consistent logging across the system
 * Uses Winston for structured logging
 */
export class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
        }),
      ],
    });
  }

  /**
   * Log an info message
   * @param message - The message to log
   * @param meta - Additional metadata
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param meta - Additional metadata
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param meta - Additional metadata
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log a debug message
   * @param message - The message to log
   * @param meta - Additional metadata
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
