import { Logger } from "./Logger";

/**
 * Metrics collector for tracking system performance and usage
 * Collects metrics for agents, tools, and overall system performance
 */
export class MetricsCollector {
  private metrics: Map<string, number>;
  private operations: Map<string, number>;
  private logger: Logger;

  constructor(logger: Logger) {
    this.metrics = new Map();
    this.operations = new Map();
    this.logger = logger;
  }

  /**
   * Start tracking an operation
   * @param name - The name of the operation
   */
  public startOperation(name: string): void {
    this.operations.set(name, Date.now());
    this.logger.debug(`Started operation: ${name}`);
  }

  /**
   * End tracking an operation and record the duration
   * @param name - The name of the operation
   */
  public endOperation(name: string): void {
    const startTime = this.operations.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.recordTiming(name, duration);
      this.operations.delete(name);
      this.logger.debug(`Ended operation: ${name}`, { duration });
    }
  }

  /**
   * Record an error for an operation
   * @param operation - The operation name
   */
  public recordError(operation: string): void {
    this.incrementCounter(`${operation}_errors`);
    this.logger.debug(`Recorded error for operation: ${operation}`);
  }

  /**
   * Increment a counter metric
   * @param name - The name of the metric
   * @param value - The value to increment by (default: 1)
   */
  public incrementCounter(name: string, value: number = 1): void {
    const currentValue = this.metrics.get(name) || 0;
    this.metrics.set(name, currentValue + value);
    this.logger.debug(`Incremented metric: ${name}`, {
      value,
      newTotal: currentValue + value,
    });
  }

  /**
   * Record a timing metric
   * @param name - The name of the metric
   * @param duration - The duration in milliseconds
   */
  public recordTiming(name: string, duration: number): void {
    this.metrics.set(`${name}_timing`, duration);
    this.logger.debug(`Recorded timing: ${name}`, { duration });
  }

  /**
   * Get the current value of a metric
   * @param name - The name of the metric
   * @returns The current value or 0 if not found
   */
  public getMetric(name: string): number {
    return this.metrics.get(name) || 0;
  }

  /**
   * Get all current metrics
   * @returns A map of all metrics
   */
  public getAllMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Reset all metrics
   */
  public resetMetrics(): void {
    this.metrics.clear();
    this.operations.clear();
    this.logger.info("Metrics reset");
  }

  /**
   * Export metrics in a format suitable for monitoring systems
   * @returns Object containing all metrics
   */
  public exportMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      metrics[key] = value;
    });
    return metrics;
  }
}
