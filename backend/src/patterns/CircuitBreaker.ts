/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by temporarily blocking calls to failing services
 */

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures to trigger open state
  successThreshold: number; // Number of successes to close circuit
  timeout: number; // Time to wait before trying again (ms)
  monitoringPeriod: number; // Time window for failure counting (ms)
  expectedErrors?: string[]; // Expected error types that don't count as failures
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private totalCalls: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private nextAttempt: number = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig,
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalCalls++;

    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker '${this.name}' is OPEN. Try again later.`,
        );
      }
      // Move to half-open state
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Execute with fallback function
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    try {
      return await this.execute(operation);
    } catch (error) {
      if (this.state === CircuitState.OPEN) {
        return await fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(error: any): void {
    // Skip expected errors
    if (this.isExpectedError(error)) {
      return;
    }

    this.lastFailureTime = Date.now();
    this.totalFailures++;
    this.failureCount++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.timeout;
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN;
        this.nextAttempt = Date.now() + this.config.timeout;
      }
    }
  }

  private isExpectedError(error: any): boolean {
    if (!this.config.expectedErrors) return false;

    const errorType = error.constructor.name;
    const errorMessage = error.message || "";

    return this.config.expectedErrors.some(
      (expectedError) =>
        errorType.includes(expectedError) ||
        errorMessage.includes(expectedError),
    );
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Force circuit state (for testing)
   */
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === CircuitState.OPEN) {
      this.nextAttempt = Date.now() + this.config.timeout;
    }
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttempt = 0;
  }
}

/**
 * Circuit Breaker Registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  createBreaker(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    const breaker = new CircuitBreaker(name, config);
    this.breakers.set(name, breaker);
    return breaker;
  }

  getBreaker(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    this.breakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics();
    });
    return metrics;
  }

  resetAll(): void {
    this.breakers.forEach((breaker) => breaker.reset());
  }
}

// Pre-configured circuit breakers for AgentCare services
export const createAgentCareCircuitBreakers = () => {
  const registry = CircuitBreakerRegistry.getInstance();

  // Ollama LLM Service Circuit Breaker
  registry.createBreaker("ollama-llm", {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
    monitoringPeriod: 60000, // 1 minute
    expectedErrors: ["NetworkError", "TimeoutError"],
  });

  // Database Circuit Breaker
  registry.createBreaker("database", {
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 15000, // 15 seconds
    monitoringPeriod: 30000, // 30 seconds
    expectedErrors: ["ConnectionTimeoutError"],
  });

  // External API Circuit Breaker
  registry.createBreaker("external-api", {
    failureThreshold: 4,
    successThreshold: 2,
    timeout: 20000, // 20 seconds
    monitoringPeriod: 45000, // 45 seconds
    expectedErrors: ["HTTPError"],
  });

  // Email Service Circuit Breaker
  registry.createBreaker("email-service", {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 10000, // 10 seconds
    monitoringPeriod: 60000, // 1 minute
    expectedErrors: ["SMTPError"],
  });

  return registry;
};
