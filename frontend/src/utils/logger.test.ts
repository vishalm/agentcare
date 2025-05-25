import { logger } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs();
  });

  it('should log debug messages', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
    logger.debug('Test debug message');
    
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('debug');
    expect(logs[0].message).toBe('Test debug message');
    
    consoleSpy.mockRestore();
  });

  it('should log info messages', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    logger.info('Test info message');
    
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].message).toBe('Test info message');
    
    consoleSpy.mockRestore();
  });

  it('should log warn messages', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger.warn('Test warn message');
    
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('warn');
    expect(logs[0].message).toBe('Test warn message');
    
    consoleSpy.mockRestore();
  });

  it('should log error messages', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    logger.error('Test error message');
    
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('error');
    expect(logs[0].message).toBe('Test error message');
    
    consoleSpy.mockRestore();
  });

  it('should handle API fallback logging', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    logger.apiFallback('API failed', new Error('Network error'));
    
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('API fallback: API failed');
    expect(logs[0].context).toBe('API');
    
    consoleSpy.mockRestore();
  });

  it('should clear logs', () => {
    logger.info('Test message');
    expect(logger.getRecentLogs()).toHaveLength(1);
    
    logger.clearLogs();
    expect(logger.getRecentLogs()).toHaveLength(0);
  });

  it('should export logs as JSON', () => {
    logger.info('Test message');
    const exported = logger.exportLogs();
    const parsed = JSON.parse(exported);
    
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].message).toBe('Test message');
  });

  it('should set log level', () => {
    logger.clearLogs(); // Clear any existing logs
    logger.setLogLevel('error');
    
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    logger.info('This should not log to console');
    expect(consoleSpy).not.toHaveBeenCalled();
    
    logger.error('This should log to console');
    expect(errorSpy).toHaveBeenCalled();
    
    // Both messages should be in history regardless of log level
    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].level).toBe('info');
    expect(logs[1].level).toBe('error');
    
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });
}); 