/**
 * 12-Factor Logging System for AgentCare
 * Factor 11: Treat logs as event streams
 * Outputs structured logs to stdout for external log aggregation
 */

import { config12Factor } from '../config/TwelveFactorConfig';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  version?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  operation?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface HealthcareLogEntry extends LogEntry {
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  hipaaCompliant?: boolean;
  auditEvent?: boolean;
}

/**
 * Factor 11: Structured logging to stdout as event stream
 */
export class TwelveFactorLogger {
  private static instance: TwelveFactorLogger;
  private config = config12Factor.getConfig();
  private serviceName: string;
  private serviceVersion?: string;

  private constructor() {
    this.serviceName = 'agentcare';
    this.serviceVersion = process.env.APP_VERSION || 'unknown';
  }

  static getInstance(): TwelveFactorLogger {
    if (!TwelveFactorLogger.instance) {
      TwelveFactorLogger.instance = new TwelveFactorLogger();
    }
    return TwelveFactorLogger.instance;
  }

  /**
   * Log error level message
   */
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log('error', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : undefined,
      metadata
    });
  }

  /**
   * Log warning level message
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, { metadata });
  }

  /**
   * Log info level message
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, { metadata });
  }

  /**
   * Log debug level message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, { metadata });
  }

  /**
   * Log HTTP request
   */
  httpRequest(req: any, res: any, duration: number): void {
    const logData = {
      operation: 'http_request',
      duration,
      metadata: {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        contentLength: res.get('Content-Length')
      }
    };

    const level: LogLevel = res.statusCode >= 500 ? 'error' : 
                           res.statusCode >= 400 ? 'warn' : 'info';
    
    this.log(level, `${req.method} ${req.url} ${res.statusCode}`, logData);
  }

  /**
   * Log database operation
   */
  dbOperation(operation: string, query: string, duration: number, error?: Error): void {
    const logData = {
      component: 'database',
      operation,
      duration,
      metadata: {
        query: this.sanitizeQuery(query)
      },
      error: error ? {
        name: error.name,
        message: error.message,
        code: (error as any).code
      } : undefined
    };

    const level: LogLevel = error ? 'error' : 'info';
    const message = error ? 
      `Database operation failed: ${operation}` :
      `Database operation completed: ${operation}`;

    this.log(level, message, logData);
  }

  /**
   * Log agent operation (healthcare-specific)
   */
  agentOperation(
    agentType: string, 
    operation: string, 
    duration: number,
    success: boolean,
    patientId?: string,
    doctorId?: string
  ): void {
    const logData: Partial<HealthcareLogEntry> = {
      component: 'agent',
      operation: `${agentType}.${operation}`,
      duration,
      patientId,
      doctorId,
      hipaaCompliant: true,
      auditEvent: true,
      metadata: {
        agentType,
        success
      }
    };

    const level: LogLevel = success ? 'info' : 'warn';
    const message = `Agent operation ${success ? 'completed' : 'failed'}: ${agentType}.${operation}`;

    this.log(level, message, logData);
  }

  /**
   * Log appointment event (HIPAA audit logging)
   */
  appointmentEvent(
    event: string,
    appointmentId: string,
    patientId: string,
    doctorId: string,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    const logData: Partial<HealthcareLogEntry> = {
      component: 'appointment',
      operation: event,
      appointmentId,
      patientId,
      doctorId,
      userId,
      hipaaCompliant: true,
      auditEvent: true,
      metadata,
      tags: ['audit', 'hipaa', 'appointment']
    };

    this.log('info', `Appointment event: ${event}`, logData);
  }

  /**
   * Log security event
   */
  securityEvent(
    event: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    const logData = {
      component: 'security',
      operation: event,
      userId,
      sessionId,
      metadata,
      tags: ['security', 'audit']
    };

    const level: LogLevel = event.includes('failure') || event.includes('breach') ? 'error' : 'warn';
    this.log(level, `Security event: ${event}`, logData);
  }

  /**
   * Log performance metric
   */
  performance(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    const logData = {
      component: 'performance',
      operation,
      duration,
      metadata: {
        ...metadata,
        success
      },
      tags: ['performance', 'metrics']
    };

    const level: LogLevel = !success ? 'warn' : 'info';
    this.log(level, `Performance: ${operation}`, logData);
  }

  /**
   * Core logging method - Factor 11 implementation
   */
  private log(level: LogLevel, message: string, additional: Partial<LogEntry> = {}): void {
    // Skip if log level is below configured threshold
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      version: this.serviceVersion,
      ...additional
    };

    // Factor 11: Output to stdout as structured event stream
    if (this.config.logging.format === 'json') {
      console.log(JSON.stringify(logEntry));
    } else {
      // Text format for development
      const timestamp = logEntry.timestamp;
      const levelStr = level.toUpperCase().padEnd(5);
      const service = `[${logEntry.service}]`;
      const component = logEntry.component ? `[${logEntry.component}]` : '';
      const operation = logEntry.operation ? `{${logEntry.operation}}` : '';
      const duration = logEntry.duration ? `(${logEntry.duration}ms)` : '';
      
      console.log(`${timestamp} ${levelStr} ${service}${component}${operation} ${message} ${duration}`);
      
      if (logEntry.error) {
        console.log(`  Error: ${logEntry.error.message}`);
        if (logEntry.error.stack && level === 'error') {
          console.log(`  Stack: ${logEntry.error.stack}`);
        }
      }
      
      if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
        console.log(`  Metadata: ${JSON.stringify(logEntry.metadata)}`);
      }
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    const configuredLevel = this.config.logging.level as LogLevel;
    return levels[level] <= levels[configuredLevel];
  }

  /**
   * Sanitize database queries for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Remove potential sensitive data from SQL queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='[REDACTED]'")
      .substring(0, 1000); // Limit query length
  }

  /**
   * Create child logger with context
   */
  child(context: Partial<LogEntry>): ChildLogger {
    return new ChildLogger(this, context);
  }

  /**
   * Set request context for correlation
   */
  setRequestContext(traceId: string, spanId?: string, userId?: string, sessionId?: string): void {
    // In a real implementation, this would use async local storage
    // For now, we'll pass context through parameters
  }
}

/**
 * Child logger with inherited context
 */
export class ChildLogger {
  constructor(
    private parent: TwelveFactorLogger,
    private context: Partial<LogEntry>
  ) {}

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.parent.error(message, error, { ...this.context.metadata, ...metadata });
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.parent.warn(message, { ...this.context.metadata, ...metadata });
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.parent.info(message, { ...this.context.metadata, ...metadata });
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.parent.debug(message, { ...this.context.metadata, ...metadata });
  }
}

/**
 * Express middleware for request logging
 */
export function requestLoggingMiddleware() {
  const logger = TwelveFactorLogger.getInstance();
  
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Add trace ID if not present
    if (!req.headers['x-trace-id']) {
      req.headers['x-trace-id'] = generateTraceId();
    }
    
    const traceId = req.headers['x-trace-id'];
    req.traceId = traceId;
    
    // Set response headers
    res.setHeader('X-Trace-ID', traceId);
    
    // Log request completion
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.httpRequest(req, res, duration);
    });
    
    next();
  };
}

/**
 * Error logging middleware
 */
export function errorLoggingMiddleware() {
  const logger = TwelveFactorLogger.getInstance();
  
  return (error: Error, req: any, res: any, next: any) => {
    logger.error('Unhandled request error', error, {
      url: req.url,
      method: req.method,
      traceId: req.traceId,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    next(error);
  };
}

/**
 * Process-level error logging
 */
export function setupProcessErrorLogging(): void {
  const logger = TwelveFactorLogger.getInstance();
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)), {
      promise: promise.toString()
    });
  });
  
  process.on('warning', (warning) => {
    logger.warn('Node.js warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    });
  });
}

// Utility functions
function generateTraceId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Export singleton logger instance
export const logger = TwelveFactorLogger.getInstance();

// Healthcare-specific logging utilities
export const healthcareLogger = {
  patientAccess: (patientId: string, userId: string, operation: string) => {
    logger.securityEvent('patient_data_access', userId, undefined, {
      patientId,
      operation,
      timestamp: new Date().toISOString()
    });
  },
  
  appointmentCreated: (appointmentId: string, patientId: string, doctorId: string, userId: string) => {
    logger.appointmentEvent('created', appointmentId, patientId, doctorId, userId);
  },
  
  appointmentCancelled: (appointmentId: string, patientId: string, doctorId: string, userId: string, reason: string) => {
    logger.appointmentEvent('cancelled', appointmentId, patientId, doctorId, userId, { reason });
  },
  
  hipaaViolation: (violation: string, userId?: string, metadata?: Record<string, any>) => {
    logger.securityEvent('hipaa_violation', userId, undefined, {
      violation,
      severity: 'critical',
      ...metadata
    });
  }
}; 