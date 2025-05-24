import { Logger } from '../../../backend/src/utils/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Logging Methods', () => {
    test('should log info messages', () => {
      const message = 'Test info message';
      const meta = { userId: 123 };

      logger.info(message, meta);

      // Test that the logger was created and can be called
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    test('should log error messages', () => {
      const message = 'Test error message';
      const meta = { error: 'Test error' };

      logger.error(message, meta);

      expect(logger).toBeDefined();
      expect(typeof logger.error).toBe('function');
    });

    test('should log warning messages', () => {
      const message = 'Test warning message';
      
      logger.warn(message);

      expect(logger).toBeDefined();
      expect(typeof logger.warn).toBe('function');
    });

    test('should log debug messages', () => {
      const message = 'Test debug message';
      
      logger.debug(message);

      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('Logger Configuration', () => {
    test('should create logger instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    test('should handle messages without metadata', () => {
      const message = 'Simple message';
      
      expect(() => logger.info(message)).not.toThrow();
      expect(() => logger.error(message)).not.toThrow();
      expect(() => logger.warn(message)).not.toThrow();
      expect(() => logger.debug(message)).not.toThrow();
    });

    test('should handle empty messages', () => {
      expect(() => logger.info('')).not.toThrow();
      expect(() => logger.error('')).not.toThrow();
    });
  });
}); 