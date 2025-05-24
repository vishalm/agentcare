import * as dotenv from 'dotenv';
import { Logger } from './Logger';

/**
 * Configuration management utility
 */
export class Config {
    private static instance: Config;
    private config: Map<string, string> = new Map();
    private logger?: Logger;

    private constructor() {
        // Load environment variables
        dotenv.config();
        this.loadEnvironmentVariables();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    /**
     * Set logger for configuration debugging
     */
    public setLogger(logger: Logger): void {
        this.logger = logger;
    }

    /**
     * Get configuration value
     */
    public get(key: string, defaultValue?: string): string {
        const value = this.config.get(key) || process.env[key] || defaultValue;
        
        if (!value && this.logger) {
            this.logger.warn(`Configuration key '${key}' not found`);
        }

        return value || '';
    }

    /**
     * Get configuration value as number
     */
    public getNumber(key: string, defaultValue?: number): number {
        const value = this.get(key);
        const parsed = parseInt(value, 10);
        
        if (isNaN(parsed)) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            throw new Error(`Configuration key '${key}' is not a valid number: ${value}`);
        }
        
        return parsed;
    }

    /**
     * Get configuration value as boolean
     */
    public getBoolean(key: string, defaultValue?: boolean): boolean {
        const value = this.get(key).toLowerCase();
        
        if (value === 'true' || value === '1' || value === 'yes') {
            return true;
        } else if (value === 'false' || value === '0' || value === 'no') {
            return false;
        } else if (defaultValue !== undefined) {
            return defaultValue;
        }
        
        throw new Error(`Configuration key '${key}' is not a valid boolean: ${value}`);
    }

    /**
     * Set configuration value
     */
    public set(key: string, value: string): void {
        this.config.set(key, value);
    }

    /**
     * Check if configuration key exists
     */
    public has(key: string): boolean {
        return this.config.has(key) || process.env[key] !== undefined;
    }

    /**
     * Get all configuration keys
     */
    public getKeys(): string[] {
        const envKeys = Object.keys(process.env);
        const configKeys = Array.from(this.config.keys());
        return [...new Set([...envKeys, ...configKeys])];
    }

    /**
     * Validate required configuration
     */
    public validateRequired(requiredKeys: string[]): void {
        const missing: string[] = [];
        
        for (const key of requiredKeys) {
            if (!this.has(key)) {
                missing.push(key);
            }
        }
        
        if (missing.length > 0) {
            const error = `Missing required configuration keys: ${missing.join(', ')}`;
            if (this.logger) {
                this.logger.error(error);
            }
            throw new Error(error);
        }
    }

    /**
     * Get environment-specific configuration
     */
    public getEnvironment(): string {
        return this.get('NODE_ENV', 'development');
    }

    /**
     * Check if running in development mode
     */
    public isDevelopment(): boolean {
        return this.getEnvironment() === 'development';
    }

    /**
     * Check if running in production mode
     */
    public isProduction(): boolean {
        return this.getEnvironment() === 'production';
    }

    /**
     * Check if running in test mode
     */
    public isTest(): boolean {
        return this.getEnvironment() === 'test';
    }

    /**
     * Load and validate environment variables
     */
    private loadEnvironmentVariables(): void {
        // Load all environment variables into config map
        for (const [key, value] of Object.entries(process.env)) {
            if (value !== undefined) {
                this.config.set(key, value);
            }
        }

        // Set default values for development
        this.setDefaults();
    }

    /**
     * Set default configuration values
     */
    private setDefaults(): void {
        const defaults = {
            NODE_ENV: 'development',
            API_PORT: '3000',
            LOG_LEVEL: 'info',
            
            // Ollama defaults
            OLLAMA_BASE_URL: 'http://localhost:11434',
            OLLAMA_MODEL: 'qwen2.5:latest',
            OLLAMA_TIMEOUT: '30000',
            OLLAMA_MAX_TOKENS: '1000',
            OLLAMA_TEMPERATURE: '0.7',
            
            // JWT defaults
            JWT_EXPIRES_IN: '24h',
            PASSWORD_SALT_ROUNDS: '12',
            
            // RAG defaults
            RAG_VECTOR_DIMENSION: '384',
            RAG_SIMILARITY_THRESHOLD: '0.3',
            RAG_MAX_CONTEXT_LENGTH: '2000',
            RAG_CLEANUP_DAYS: '30',
            
            // API defaults
            API_RATE_LIMIT: '100',
            API_RATE_WINDOW: '900000',
            CORS_ORIGIN: '*',
            
            // Feature flags
            ENABLE_OLLAMA_LLM: 'true',
            ENABLE_RAG_SYSTEM: 'true',
            ENABLE_USER_REGISTRATION: 'true',
            ENABLE_GUEST_BOOKING: 'true',
            ENABLE_SMS_NOTIFICATIONS: 'false',
            ENABLE_CALENDAR_SYNC: 'false',
            ENABLE_EMAIL_REMINDERS: 'true',
            
            // Development tools
            DEBUG_MODE: 'false',
            ENABLE_API_DOCS: 'true',
            ENABLE_PLAYGROUND: 'true',
            
            // Healthcare compliance
            HIPAA_LOGGING: 'true',
            AUDIT_LOG_RETENTION_DAYS: '2555',
            PATIENT_DATA_RETENTION_YEARS: '7'
        };

        // Set defaults for keys that don't exist
        for (const [key, value] of Object.entries(defaults)) {
            if (!this.has(key)) {
                this.config.set(key, value);
            }
        }
    }

    /**
     * Export current configuration for debugging
     */
    public exportConfig(includeSecrets: boolean = false): Record<string, string> {
        const secretKeys = [
            'JWT_SECRET', 'SESSION_SECRET', 'DATABASE_PASSWORD', 
            'SMTP_PASS', 'TWILIO_AUTH_TOKEN', 'DATA_ENCRYPTION_KEY'
        ];

        const exported: Record<string, string> = {};
        
        for (const [key, value] of this.config.entries()) {
            if (!includeSecrets && secretKeys.some(secret => key.includes(secret))) {
                exported[key] = '***HIDDEN***';
            } else {
                exported[key] = value;
            }
        }
        
        return exported;
    }

    /**
     * Reload configuration from environment
     */
    public reload(): void {
        dotenv.config({ override: true });
        this.loadEnvironmentVariables();
        
        if (this.logger) {
            this.logger.info('Configuration reloaded');
        }
    }
} 