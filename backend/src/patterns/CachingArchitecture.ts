/**
 * Multi-Tier Caching Architecture for AgentCare
 * Implements in-memory, Redis, and database caching with intelligent cache management
 */

import { EventEmitter } from "events";

// Cache Interface
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
}

// In-Memory Cache Implementation (L1 Cache)
export class InMemoryCache implements CacheProvider {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
    this.stats.sets++;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.stats.deletes++;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return -1;

    const remaining = Math.max(0, item.expiry - Date.now());
    return Math.floor(remaining / 1000);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Redis Cache Implementation (L2 Cache)
export class RedisCache implements CacheProvider {
  private connected: boolean = false;
  private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

  constructor(
    private config: { host: string; port: number; password?: string },
  ) {
    // In a real implementation, this would connect to Redis
    this.connected = true;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;

    try {
      // Simulated Redis get operation
      // In real implementation: return await this.client.get(key);
      this.stats.hits++;
      return null; // Simulated cache miss
    } catch (error) {
      this.stats.misses++;
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    if (!this.connected) return;

    try {
      // Simulated Redis set operation
      // In real implementation: await this.client.setex(key, ttl, JSON.stringify(value));
      this.stats.sets++;
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      // Simulated Redis delete operation
      // In real implementation: await this.client.del(key);
      this.stats.deletes++;
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  }

  async clear(): Promise<void> {
    if (!this.connected) return;

    try {
      // Simulated Redis flush operation
      // In real implementation: await this.client.flushdb();
    } catch (error) {
      console.error("Redis clear error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected) return false;

    try {
      // Simulated Redis exists operation
      // In real implementation: return (await this.client.exists(key)) === 1;
      return false;
    } catch (error) {
      console.error("Redis exists error:", error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.connected) return -1;

    try {
      // Simulated Redis TTL operation
      // In real implementation: return await this.client.ttl(key);
      return -1;
    } catch (error) {
      console.error("Redis TTL error:", error);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.connected) return [];

    try {
      // Simulated Redis keys operation
      // In real implementation: return await this.client.keys(pattern);
      return [];
    } catch (error) {
      console.error("Redis keys error:", error);
      return [];
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      connected: this.connected,
    };
  }
}

// Multi-Tier Cache Manager
export class MultiTierCacheManager {
  private l1Cache: InMemoryCache;
  private l2Cache: RedisCache;
  private stats = { l1Hits: 0, l2Hits: 0, misses: 0 };
  private eventEmitter = new EventEmitter();

  constructor(redisConfig: { host: string; port: number; password?: string }) {
    this.l1Cache = new InMemoryCache();
    this.l2Cache = new RedisCache(redisConfig);

    // Setup cleanup interval for L1 cache
    setInterval(() => {
      this.l1Cache.cleanup();
    }, 60000); // Every minute
  }

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    let value = await this.l1Cache.get<T>(key);
    if (value !== null) {
      this.stats.l1Hits++;
      this.eventEmitter.emit("cache-hit", { tier: "L1", key });
      return value;
    }

    // Try L2 cache (Redis)
    value = await this.l2Cache.get<T>(key);
    if (value !== null) {
      // Populate L1 cache with shorter TTL
      await this.l1Cache.set(key, value, 300);
      this.stats.l2Hits++;
      this.eventEmitter.emit("cache-hit", { tier: "L2", key });
      return value;
    }

    this.stats.misses++;
    this.eventEmitter.emit("cache-miss", { key });
    return null;
  }

  async set<T>(
    key: string,
    value: T,
    l1Ttl: number = 300,
    l2Ttl: number = 3600,
  ): Promise<void> {
    // Set in both caches
    await Promise.all([
      this.l1Cache.set(key, value, l1Ttl),
      this.l2Cache.set(key, value, l2Ttl),
    ]);

    this.eventEmitter.emit("cache-set", { key, l1Ttl, l2Ttl });
  }

  async delete(key: string): Promise<void> {
    await Promise.all([this.l1Cache.delete(key), this.l2Cache.delete(key)]);

    this.eventEmitter.emit("cache-delete", { key });
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const l1Keys = await this.l1Cache.keys(pattern);
    const l2Keys = await this.l2Cache.keys(pattern);

    await Promise.all([
      ...l1Keys.map((key) => this.l1Cache.delete(key)),
      ...l2Keys.map((key) => this.l2Cache.delete(key)),
    ]);

    this.eventEmitter.emit("cache-invalidate", {
      pattern,
      count: l1Keys.length + l2Keys.length,
    });
  }

  getStats() {
    const total = this.stats.l1Hits + this.stats.l2Hits + this.stats.misses;
    return {
      ...this.stats,
      totalHitRate:
        total > 0 ? (this.stats.l1Hits + this.stats.l2Hits) / total : 0,
      l1HitRate: total > 0 ? this.stats.l1Hits / total : 0,
      l2HitRate: total > 0 ? this.stats.l2Hits / total : 0,
      l1Stats: this.l1Cache.getStats(),
      l2Stats: this.l2Cache.getStats(),
    };
  }

  onCacheEvent(event: string, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }
}

// Healthcare-specific Cache Keys
export class HealthcareCacheKeys {
  static patient(patientId: string): string {
    return `patient:${patientId}`;
  }

  static patientAppointments(patientId: string): string {
    return `patient:${patientId}:appointments`;
  }

  static doctor(doctorId: string): string {
    return `doctor:${doctorId}`;
  }

  static doctorAvailability(doctorId: string, date: string): string {
    return `doctor:${doctorId}:availability:${date}`;
  }

  static appointment(appointmentId: string): string {
    return `appointment:${appointmentId}`;
  }

  static departmentDoctors(department: string): string {
    return `department:${department}:doctors`;
  }

  static userSession(sessionId: string): string {
    return `session:${sessionId}`;
  }

  static llmResponse(hash: string): string {
    return `llm:response:${hash}`;
  }

  static agentState(agentId: string): string {
    return `agent:${agentId}:state`;
  }
}

// Cache Decorator for Methods
export function Cached(
  keyGenerator: (...args: any[]) => string,
  ttl: number = 300,
  tier: "L1" | "L2" | "BOTH" = "BOTH",
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args);
      // Access cacheManager from the class instance
      const cacheManager = (this as any).cacheManager as MultiTierCacheManager;

      if (cacheManager) {
        // Try to get from cache
        const cachedResult = await cacheManager.get(cacheKey);
        if (cachedResult !== null) {
          return cachedResult;
        }
      }

      // Execute original method
      const result = await method.apply(this, args);

      if (cacheManager && result !== null && result !== undefined) {
        // Cache the result using public methods
        if (tier === "L1") {
          // Use the public set method with appropriate TTL for L1 cache simulation
          await cacheManager.set(cacheKey, result, ttl, 0);
        } else if (tier === "L2") {
          // Use the public set method with appropriate TTL for L2 cache simulation
          await cacheManager.set(cacheKey, result, 0, ttl);
        } else {
          await cacheManager.set(cacheKey, result, ttl, ttl * 2);
        }
      }

      return result;
    };
  };
}

// Cache Warming Service
export class CacheWarmingService {
  private cacheManager: MultiTierCacheManager;
  private warmingJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(cacheManager: MultiTierCacheManager) {
    this.cacheManager = cacheManager;
  }

  scheduleWarming(
    key: string,
    dataLoader: () => Promise<any>,
    interval: number = 3600000, // 1 hour
  ): void {
    // Cancel existing job if any
    this.cancelWarming(key);

    const job = setInterval(async () => {
      try {
        const data = await dataLoader();
        await this.cacheManager.set(key, data);
        console.log(`Cache warmed for operation type: ${key.split(':')[0]}`);
      } catch (error) {
        console.error(`Cache warming failed for operation type ${key.split(':')[0]}:`, error instanceof Error ? error.message : String(error));
      }
    }, interval);

    this.warmingJobs.set(key, job);
  }

  cancelWarming(key: string): void {
    const job = this.warmingJobs.get(key);
    if (job) {
      clearInterval(job);
      this.warmingJobs.delete(key);
    }
  }

  async warmHealthcareData(): Promise<void> {
    // Warm frequently accessed data
    this.scheduleWarming(
      "departments:all",
      async () => {
        // Load all departments
        return ["Cardiology", "Neurology", "Orthopedics", "Pediatrics"];
      },
      3600000, // 1 hour
    );

    this.scheduleWarming(
      "doctors:available",
      async () => {
        // Load available doctors
        return [];
      },
      1800000, // 30 minutes
    );
  }

  destroy(): void {
    for (const job of this.warmingJobs.values()) {
      clearInterval(job);
    }
    this.warmingJobs.clear();
  }
}

// Cache Analytics
export class CacheAnalytics {
  private cacheManager: MultiTierCacheManager;
  private metrics: Array<{
    timestamp: Date;
    stats: any;
  }> = [];

  constructor(cacheManager: MultiTierCacheManager) {
    this.cacheManager = cacheManager;
    this.startMetricsCollection();
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      const stats = this.cacheManager.getStats();
      this.metrics.push({
        timestamp: new Date(),
        stats,
      });

      // Keep only last 24 hours of metrics
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metrics = this.metrics.filter((metric) => metric.timestamp > cutoff);
    }, 60000); // Every minute
  }

  getHourlyHitRates(): Array<{ hour: number; hitRate: number }> {
    const hourlyData = new Map<number, { hits: number; total: number }>();

    this.metrics.forEach((metric) => {
      const hour = metric.timestamp.getHours();
      const hits = metric.stats.l1Hits + metric.stats.l2Hits;
      const total = hits + metric.stats.misses;

      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { hits: 0, total: 0 });
      }

      const data = hourlyData.get(hour)!;
      data.hits += hits;
      data.total += total;
    });

    return Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      hitRate: data.total > 0 ? data.hits / data.total : 0,
    }));
  }

  getCacheEfficiency(): {
    l1Efficiency: number;
    l2Efficiency: number;
    overallEfficiency: number;
    recommendations: string[];
  } {
    const stats = this.cacheManager.getStats();
    const recommendations: string[] = [];

    if (stats.l1HitRate < 0.5) {
      recommendations.push("Consider increasing L1 cache TTL or size");
    }

    if (stats.l2HitRate < 0.3) {
      recommendations.push(
        "Review L2 cache configuration or data access patterns",
      );
    }

    if (stats.totalHitRate < 0.7) {
      recommendations.push(
        "Implement cache warming for frequently accessed data",
      );
    }

    return {
      l1Efficiency: stats.l1HitRate,
      l2Efficiency: stats.l2HitRate,
      overallEfficiency: stats.totalHitRate,
      recommendations,
    };
  }
}

// AgentCare Cache Service Factory
export class AgentCareCacheFactory {
  static create(redisConfig: {
    host: string;
    port: number;
    password?: string;
  }): {
    cacheManager: MultiTierCacheManager;
    warmingService: CacheWarmingService;
    analytics: CacheAnalytics;
  } {
    const cacheManager = new MultiTierCacheManager(redisConfig);
    const warmingService = new CacheWarmingService(cacheManager);
    const analytics = new CacheAnalytics(cacheManager);

    // Setup healthcare-specific cache warming
    warmingService.warmHealthcareData();

    // Setup cache event logging
    cacheManager.onCacheEvent("cache-hit", (data) => {
      console.log(`Cache hit on ${data.tier}: ${data.key?.split(':')[0] ?? 'unknown'}`);
    });

    cacheManager.onCacheEvent("cache-miss", (data) => {
      console.log(`Cache miss: ${data.key?.split(':')[0] ?? 'unknown'}`);
    });

    return {
      cacheManager,
      warmingService,
      analytics,
    };
  }
}
