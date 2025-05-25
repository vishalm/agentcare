type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    // Check if we're in development mode (Vite or Node.js)
    this.isDevelopment = (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') ||
                        (typeof window !== 'undefined' && (window as any).import?.meta?.env?.DEV);
    this.logLevel = this.isDevelopment ? 'debug' : 'warn';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.logLevel];
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}]` : '';
    return `${prefix} ${entry.message}`;
  }

  debug(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('debug', message, data, context);
    this.addToHistory(entry);
    
    if (this.shouldLog('debug')) {
      if (data) {
        console.debug(this.formatMessage(entry), data);
      } else {
        console.debug(this.formatMessage(entry));
      }
    }
  }

  info(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('info', message, data, context);
    this.addToHistory(entry);
    
    if (this.shouldLog('info')) {
      if (data) {
        console.info(this.formatMessage(entry), data);
      } else {
        console.info(this.formatMessage(entry));
      }
    }
  }

  warn(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('warn', message, data, context);
    this.addToHistory(entry);
    
    if (this.shouldLog('warn')) {
      if (data) {
        console.warn(this.formatMessage(entry), data);
      } else {
        console.warn(this.formatMessage(entry));
      }
    }
  }

  error(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('error', message, data, context);
    this.addToHistory(entry);
    
    if (this.shouldLog('error')) {
      if (data) {
        console.error(this.formatMessage(entry), data);
      } else {
        console.error(this.formatMessage(entry));
      }
    }
  }

  // API fallback logging - only logs in development or when explicitly enabled
  apiFallback(message: string, error?: any, context?: string): void {
    if (this.isDevelopment) {
      this.warn(`API fallback: ${message}`, error, context || 'API');
    } else {
      // In production, just store in history without console output
      const entry = this.createLogEntry('warn', `API fallback: ${message}`, error, context || 'API');
      this.addToHistory(entry);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear log history
  clearLogs(): void {
    this.logs = [];
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();
export default logger; 