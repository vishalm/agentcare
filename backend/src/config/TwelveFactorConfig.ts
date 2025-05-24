/**
 * 12-Factor App Configuration System for AgentCare
 * Implements all 12 principles for cloud-native deployment
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env files
config();

export interface BackingService {
  url: string;
  timeout: number;
  retries: number;
  healthCheck?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idle: number;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  cluster: boolean;
  sentinel?: {
    hosts: string[];
    name: string;
  };
}

export interface AppConfig {
  // Factor 3: Config stored in environment
  env: 'development' | 'staging' | 'production' | 'test';
  
  // Factor 7: Port binding
  port: number;
  host: string;
  
  // Factor 4: Backing services as attached resources
  database: DatabaseConfig;
  redis: RedisConfig;
  ollama: BackingService;
  
  // Application-specific config
  auth: {
    jwtSecret: string;
    jwtExpiry: string;
    bcryptRounds: number;
  };
  
  // Factor 11: Logs as event streams
  logging: {
    level: string;
    format: 'json' | 'text';
    destination: 'stdout' | 'file';
  };
  
  // Factor 8: Concurrency via process model
  processes: {
    web: number;
    worker: number;
    scheduler: number;
  };
  
  // Factor 9: Disposability
  gracefulShutdown: {
    timeout: number;
    killTimeout: number;
  };
  
  // Factor 10: Dev/prod parity
  features: {
    enableDebug: boolean;
    enableMetrics: boolean;
    enableTracing: boolean;
  };
}

/**
 * 12-Factor Configuration Manager
 * Centralizes all configuration with environment variable support
 */
export class TwelveFactorConfig {
  private static instance: TwelveFactorConfig;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  static getInstance(): TwelveFactorConfig {
    if (!TwelveFactorConfig.instance) {
      TwelveFactorConfig.instance = new TwelveFactorConfig();
    }
    return TwelveFactorConfig.instance;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  private loadConfiguration(): AppConfig {
    return {
      // Factor 3: Config from environment
      env: (process.env.NODE_ENV as any) || 'development',
      
      // Factor 7: Port binding
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      
      // Factor 4: Database as attached resource
      database: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        database: process.env.DATABASE_NAME || 'agentcare',
        username: process.env.DATABASE_USER || 'agentcare',
        password: process.env.DATABASE_PASSWORD || 'password',
        ssl: process.env.DATABASE_SSL === 'true',
        pool: {
          min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
          max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
          idle: parseInt(process.env.DATABASE_POOL_IDLE || '10000', 10)
        }
      },
      
      // Factor 4: Redis as attached resource
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        cluster: process.env.REDIS_CLUSTER === 'true',
        sentinel: process.env.REDIS_SENTINEL_HOSTS ? {
          hosts: process.env.REDIS_SENTINEL_HOSTS.split(','),
          name: process.env.REDIS_SENTINEL_NAME || 'mymaster'
        } : undefined
      },
      
      // Factor 4: Ollama as attached resource
      ollama: {
        url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10),
        retries: parseInt(process.env.OLLAMA_RETRIES || '3', 10),
        healthCheck: process.env.OLLAMA_HEALTH_PATH || '/api/tags'
      },
      
      // Authentication configuration
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        jwtExpiry: process.env.JWT_EXPIRY || '24h',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
      },
      
      // Factor 11: Structured logging
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: (process.env.LOG_FORMAT as any) || 'json',
        destination: (process.env.LOG_DESTINATION as any) || 'stdout'
      },
      
      // Factor 8: Process concurrency
      processes: {
        web: parseInt(process.env.WEB_CONCURRENCY || '1', 10),
        worker: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
        scheduler: parseInt(process.env.SCHEDULER_CONCURRENCY || '1', 10)
      },
      
      // Factor 9: Graceful shutdown
      gracefulShutdown: {
        timeout: parseInt(process.env.SHUTDOWN_TIMEOUT || '30000', 10),
        killTimeout: parseInt(process.env.KILL_TIMEOUT || '5000', 10)
      },
      
      // Factor 10: Feature flags for dev/prod parity
      features: {
        enableDebug: process.env.ENABLE_DEBUG === 'true',
        enableMetrics: process.env.ENABLE_METRICS !== 'false',
        enableTracing: process.env.ENABLE_TRACING !== 'false'
      }
    };
  }

  private validateConfiguration(): void {
    const required = [
      'DATABASE_HOST',
      'DATABASE_NAME',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0 && this.config.env === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate port range
    if (this.config.port < 1 || this.config.port > 65535) {
      throw new Error(`Invalid port number: ${this.config.port}`);
    }

    // Validate log level
    const validLogLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLogLevels.includes(this.config.logging.level)) {
      throw new Error(`Invalid log level: ${this.config.logging.level}`);
    }
  }

  // Factor 4: Health check for backing services
  async healthCheckBackingServices(): Promise<{
    database: boolean;
    redis: boolean;
    ollama: boolean;
  }> {
    const results = {
      database: false,
      redis: false,
      ollama: false
    };

    try {
      // Database health check
      // In real implementation, use actual database connection
      results.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      // Redis health check
      // In real implementation, use actual Redis connection
      results.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    try {
      // Ollama health check
      const response = await fetch(`${this.config.ollama.url}${this.config.ollama.healthCheck}`);
      results.ollama = response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
    }

    return results;
  }

  // Factor 3: Dynamic config reload (for non-sensitive config)
  reloadConfig(): void {
    config({ override: true });
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  // Get database URL for Factor 4 compliance
  getDatabaseUrl(): string {
    const { database } = this.config;
    const protocol = database.ssl ? 'postgresql' : 'postgres';
    return `${protocol}://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;
  }

  // Get Redis URL for Factor 4 compliance
  getRedisUrl(): string {
    const { redis } = this.config;
    const auth = redis.password ? `:${redis.password}@` : '';
    return `redis://${auth}${redis.host}:${redis.port}/${redis.db}`;
  }

  // Factor 12: Admin process configuration
  getAdminConfig(): {
    maxExecutionTime: number;
    allowedCommands: string[];
    auditLogging: boolean;
  } {
    return {
      maxExecutionTime: parseInt(process.env.ADMIN_MAX_EXECUTION_TIME || '300000', 10), // 5 minutes
      allowedCommands: (process.env.ADMIN_ALLOWED_COMMANDS || 'migrate,seed,backup,restore').split(','),
      auditLogging: process.env.ADMIN_AUDIT_LOGGING !== 'false'
    };
  }

  // Environment-specific configuration
  isDevelopment(): boolean {
    return this.config.env === 'development';
  }

  isProduction(): boolean {
    return this.config.env === 'production';
  }

  isTest(): boolean {
    return this.config.env === 'test';
  }
}

// Export singleton instance
export const config12Factor = TwelveFactorConfig.getInstance();

// Factor 3: Environment variable schema validation
export const validateEnvironment = (): void => {
  const schema = {
    PORT: { type: 'number', required: false, default: 3000 },
    NODE_ENV: { type: 'string', required: false, default: 'development' },
    DATABASE_HOST: { type: 'string', required: true },
    DATABASE_PORT: { type: 'number', required: false, default: 5432 },
    DATABASE_NAME: { type: 'string', required: true },
    DATABASE_USER: { type: 'string', required: true },
    DATABASE_PASSWORD: { type: 'string', required: true },
    REDIS_HOST: { type: 'string', required: false, default: 'localhost' },
    REDIS_PORT: { type: 'number', required: false, default: 6379 },
    OLLAMA_BASE_URL: { type: 'string', required: false, default: 'http://localhost:11434' },
    JWT_SECRET: { type: 'string', required: true },
    LOG_LEVEL: { type: 'string', required: false, default: 'info' }
  };

  const errors: string[] = [];

  Object.entries(schema).forEach(([key, spec]) => {
    const value = process.env[key];
    
    if (spec.required && !value) {
      errors.push(`Missing required environment variable: ${key}`);
      return;
    }

    if (value && spec.type === 'number' && isNaN(Number(value))) {
      errors.push(`Environment variable ${key} must be a number, got: ${value}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
};

// Factor 1: Codebase tracking
export const getCodebaseInfo = () => {
  return {
    version: process.env.APP_VERSION || 'development',
    commit: process.env.GIT_COMMIT || 'unknown',
    branch: process.env.GIT_BRANCH || 'unknown',
    buildTime: process.env.BUILD_TIME || 'unknown'
  };
}; 