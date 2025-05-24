import { Logger } from "./Logger";
import { MetricsCollector } from "./MetricsCollector";

/**
 * Custom error types for the system
 */
export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentError";
  }
}

export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error handler utility for consistent error handling across the system
 */
export class ErrorHandler {
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor(logger: Logger, metrics: MetricsCollector) {
    this.logger = logger;
    this.metrics = metrics;
  }

  /**
   * Handle an error and return a user-friendly message
   * @param error - The error to handle
   * @returns A user-friendly error message
   */
  public handleError(error: Error): string {
    // Log the error
    this.logger.error("Error occurred", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Increment error metric
    this.metrics.incrementCounter(`error_${error.name.toLowerCase()}`);

    // Return user-friendly message based on error type
    if (error instanceof AgentError) {
      return "There was an issue processing your request. Please try again.";
    } else if (error instanceof ToolError) {
      return "A system tool encountered an error. Our team has been notified.";
    } else if (error instanceof ValidationError) {
      return error.message;
    } else {
      return "An unexpected error occurred. Please try again later.";
    }
  }

  /**
   * Check if an error is retryable
   * @param error - The error to check
   * @returns Whether the error is retryable
   */
  public isRetryable(error: Error): boolean {
    return error instanceof AgentError || error instanceof ToolError;
  }

  /**
   * Get the error type for metrics and logging
   * @param error - The error to get the type for
   * @returns The error type
   */
  public getErrorType(error: Error): string {
    if (error instanceof AgentError) return "agent";
    if (error instanceof ToolError) return "tool";
    if (error instanceof ValidationError) return "validation";
    return "unknown";
  }
}
