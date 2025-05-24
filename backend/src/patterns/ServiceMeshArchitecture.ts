/**
 * Service Mesh Architecture for AgentCare Microservices
 * Implements service discovery, load balancing, and inter-service communication
 */

import { EventEmitter } from 'events';
import { CircuitBreaker, CircuitBreakerRegistry } from './CircuitBreaker';

// Service Registry Interface
export interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  healthCheckPath: string;
  metadata: Record<string, any>;
  registeredAt: Date;
  lastHeartbeat: Date;
  status: 'healthy' | 'unhealthy' | 'unknown';
}

export interface ServiceRegistry {
  register(service: ServiceInstance): Promise<void>;
  deregister(serviceId: string): Promise<void>;
  discover(serviceName: string): Promise<ServiceInstance[]>;
  getHealthyInstances(serviceName: string): Promise<ServiceInstance[]>;
  updateHeartbeat(serviceId: string): Promise<void>;
  getAllServices(): Promise<ServiceInstance[]>;
}

// In-Memory Service Registry Implementation
export class InMemoryServiceRegistry implements ServiceRegistry {
  private services: Map<string, ServiceInstance> = new Map();
  private servicesByName: Map<string, Set<string>> = new Map();
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    // Start health check process
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Every 30 seconds
  }

  async register(service: ServiceInstance): Promise<void> {
    this.services.set(service.id, service);
    
    if (!this.servicesByName.has(service.name)) {
      this.servicesByName.set(service.name, new Set());
    }
    this.servicesByName.get(service.name)!.add(service.id);
    
    console.log(`Service registered: ${service.name} (${service.id}) at ${service.host}:${service.port}`);
  }

  async deregister(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      this.servicesByName.get(service.name)?.delete(serviceId);
      console.log(`Service deregistered: ${service.name} (${serviceId})`);
    }
  }

  async discover(serviceName: string): Promise<ServiceInstance[]> {
    const serviceIds = this.servicesByName.get(serviceName) || new Set();
    const instances: ServiceInstance[] = [];
    
    for (const serviceId of serviceIds) {
      const instance = this.services.get(serviceId);
      if (instance) {
        instances.push(instance);
      }
    }
    
    return instances;
  }

  async getHealthyInstances(serviceName: string): Promise<ServiceInstance[]> {
    const instances = await this.discover(serviceName);
    return instances.filter(instance => instance.status === 'healthy');
  }

  async updateHeartbeat(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (service) {
      service.lastHeartbeat = new Date();
      service.status = 'healthy';
    }
  }

  async getAllServices(): Promise<ServiceInstance[]> {
    return Array.from(this.services.values());
  }

  private async performHealthChecks(): Promise<void> {
    const now = Date.now();
    const healthCheckTimeout = 60000; // 1 minute
    
    for (const service of this.services.values()) {
      const timeSinceLastHeartbeat = now - service.lastHeartbeat.getTime();
      
      if (timeSinceLastHeartbeat > healthCheckTimeout) {
        service.status = 'unhealthy';
        console.log(`Service marked unhealthy: ${service.name} (${service.id})`);
      }
      
      // Perform actual health check
      try {
        await this.checkServiceHealth(service);
      } catch (error) {
        service.status = 'unhealthy';
        console.error(`Health check failed for ${service.name}: ${error}`);
      }
    }
  }

  private async checkServiceHealth(service: ServiceInstance): Promise<void> {
    // In a real implementation, this would make HTTP requests to health endpoints
    // For now, we'll simulate based on heartbeat
    const timeSinceHeartbeat = Date.now() - service.lastHeartbeat.getTime();
    if (timeSinceHeartbeat < 60000) {
      service.status = 'healthy';
    } else {
      service.status = 'unhealthy';
    }
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Load Balancing Strategies
export interface LoadBalancer {
  selectInstance(instances: ServiceInstance[]): ServiceInstance | null;
}

export class RoundRobinLoadBalancer implements LoadBalancer {
  private counters: Map<string, number> = new Map();

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    
    const serviceName = instances[0].name;
    const currentCounter = this.counters.get(serviceName) || 0;
    const selectedIndex = currentCounter % instances.length;
    
    this.counters.set(serviceName, currentCounter + 1);
    return instances[selectedIndex];
  }
}

export class WeightedLoadBalancer implements LoadBalancer {
  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    
    // Use metadata.weight or default to 1
    const weights = instances.map(instance => instance.metadata.weight || 1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < instances.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return instances[i];
      }
    }
    
    return instances[instances.length - 1];
  }
}

export class LeastConnectionsLoadBalancer implements LoadBalancer {
  private connections: Map<string, number> = new Map();

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    
    let selectedInstance = instances[0];
    let minConnections = this.connections.get(selectedInstance.id) || 0;
    
    for (const instance of instances) {
      const connections = this.connections.get(instance.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }
    
    return selectedInstance;
  }

  incrementConnections(serviceId: string): void {
    const current = this.connections.get(serviceId) || 0;
    this.connections.set(serviceId, current + 1);
  }

  decrementConnections(serviceId: string): void {
    const current = this.connections.get(serviceId) || 0;
    this.connections.set(serviceId, Math.max(0, current - 1));
  }
}

// Service Mesh Gateway
export class ServiceMeshGateway {
  private serviceRegistry: ServiceRegistry;
  private loadBalancer: LoadBalancer;
  private circuitBreakerRegistry: CircuitBreakerRegistry;
  private requestTimeouts: Map<string, number> = new Map();
  private retryPolicies: Map<string, RetryPolicy> = new Map();

  constructor(
    serviceRegistry: ServiceRegistry,
    loadBalancer: LoadBalancer = new RoundRobinLoadBalancer()
  ) {
    this.serviceRegistry = serviceRegistry;
    this.loadBalancer = loadBalancer;
    this.circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
  }

  async callService<T>(
    serviceName: string,
    operation: (serviceUrl: string) => Promise<T>,
    options: {
      timeout?: number;
      retries?: number;
      fallback?: () => Promise<T>;
    } = {}
  ): Promise<T> {
    const instances = await this.serviceRegistry.getHealthyInstances(serviceName);
    
    if (instances.length === 0) {
      if (options.fallback) {
        return options.fallback();
      }
      throw new Error(`No healthy instances available for service: ${serviceName}`);
    }

    const selectedInstance = this.loadBalancer.selectInstance(instances);
    if (!selectedInstance) {
      throw new Error(`Failed to select instance for service: ${serviceName}`);
    }

    const serviceUrl = `http://${selectedInstance.host}:${selectedInstance.port}`;
    const circuitBreaker = this.circuitBreakerRegistry.getBreaker(serviceName);

    if (circuitBreaker) {
      if (options.fallback) {
        return circuitBreaker.executeWithFallback(
          () => this.executeWithRetry(operation, serviceUrl, options),
          options.fallback
        );
      } else {
        return circuitBreaker.execute(() => this.executeWithRetry(operation, serviceUrl, options));
      }
    } else {
      return this.executeWithRetry(operation, serviceUrl, options);
    }
  }

  private async executeWithRetry<T>(
    operation: (serviceUrl: string) => Promise<T>,
    serviceUrl: string,
    options: { timeout?: number; retries?: number }
  ): Promise<T> {
    const maxRetries = options.retries || 3;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (options.timeout) {
          return await this.withTimeout(operation(serviceUrl), options.timeout);
        } else {
          return await operation(serviceUrl);
        }
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setRetryPolicy(serviceName: string, policy: RetryPolicy): void {
    this.retryPolicies.set(serviceName, policy);
  }

  setTimeout(serviceName: string, timeoutMs: number): void {
    this.requestTimeouts.set(serviceName, timeoutMs);
  }
}

// Retry Policy Configuration
export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// Service Mesh Middleware
export class ServiceMeshMiddleware {
  private serviceRegistry: ServiceRegistry;
  private gateway: ServiceMeshGateway;

  constructor(serviceRegistry: ServiceRegistry, gateway: ServiceMeshGateway) {
    this.serviceRegistry = serviceRegistry;
    this.gateway = gateway;
  }

  // Express middleware for service registration
  registerService(serviceConfig: Omit<ServiceInstance, 'registeredAt' | 'lastHeartbeat' | 'status'>) {
    return async (req: any, res: any, next: any) => {
      const service: ServiceInstance = {
        ...serviceConfig,
        registeredAt: new Date(),
        lastHeartbeat: new Date(),
        status: 'healthy'
      };

      await this.serviceRegistry.register(service);
      
      // Set up heartbeat
      const heartbeatInterval = setInterval(async () => {
        await this.serviceRegistry.updateHeartbeat(service.id);
      }, 15000); // Every 15 seconds

      // Cleanup on process exit
      process.on('SIGTERM', async () => {
        clearInterval(heartbeatInterval);
        await this.serviceRegistry.deregister(service.id);
      });

      next();
    };
  }

  // Middleware for request tracing
  requestTracing() {
    return (req: any, res: any, next: any) => {
      const traceId = req.headers['x-trace-id'] || this.generateTraceId();
      const spanId = this.generateSpanId();
      
      req.traceId = traceId;
      req.spanId = spanId;
      
      res.setHeader('X-Trace-ID', traceId);
      res.setHeader('X-Span-ID', spanId);
      
      next();
    };
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateSpanId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// AgentCare Microservices Configuration
export interface AgentCareService {
  name: string;
  port: number;
  healthPath: string;
  dependencies: string[];
  scaling: {
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization: number;
  };
}

export const AGENTCARE_SERVICES: Record<string, AgentCareService> = {
  'user-management': {
    name: 'user-management',
    port: 3001,
    healthPath: '/health',
    dependencies: ['database', 'redis'],
    scaling: {
      minInstances: 2,
      maxInstances: 10,
      targetCpuUtilization: 70
    }
  },
  'appointment-service': {
    name: 'appointment-service',
    port: 3002,
    healthPath: '/health',
    dependencies: ['database', 'user-management', 'notification-service'],
    scaling: {
      minInstances: 3,
      maxInstances: 15,
      targetCpuUtilization: 60
    }
  },
  'llm-service': {
    name: 'llm-service',
    port: 3003,
    healthPath: '/health',
    dependencies: ['ollama'],
    scaling: {
      minInstances: 1,
      maxInstances: 3,
      targetCpuUtilization: 80
    }
  },
  'notification-service': {
    name: 'notification-service',
    port: 3004,
    healthPath: '/health',
    dependencies: ['database', 'email-service'],
    scaling: {
      minInstances: 2,
      maxInstances: 8,
      targetCpuUtilization: 50
    }
  },
  'analytics-service': {
    name: 'analytics-service',
    port: 3005,
    healthPath: '/health',
    dependencies: ['database', 'appointment-service'],
    scaling: {
      minInstances: 1,
      maxInstances: 5,
      targetCpuUtilization: 65
    }
  }
};

// Service Mesh Factory
export class ServiceMeshFactory {
  static create(): {
    serviceRegistry: ServiceRegistry;
    gateway: ServiceMeshGateway;
    middleware: ServiceMeshMiddleware;
  } {
    const serviceRegistry = new InMemoryServiceRegistry();
    const loadBalancer = new RoundRobinLoadBalancer();
    const gateway = new ServiceMeshGateway(serviceRegistry, loadBalancer);
    const middleware = new ServiceMeshMiddleware(serviceRegistry, gateway);

    // Configure circuit breakers for AgentCare services
    const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();
    
    Object.keys(AGENTCARE_SERVICES).forEach(serviceName => {
      circuitBreakerRegistry.createBreaker(serviceName, {
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 30000,
        monitoringPeriod: 60000,
        expectedErrors: ['TimeoutError', 'NetworkError']
      });
    });

    return {
      serviceRegistry,
      gateway,
      middleware
    };
  }
}

// Health Check Aggregator
export class HealthCheckAggregator {
  private serviceRegistry: ServiceRegistry;

  constructor(serviceRegistry: ServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }

  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Array<{
      name: string;
      status: string;
      instances: number;
      healthyInstances: number;
    }>;
  }> {
    const allServices = await this.serviceRegistry.getAllServices();
    const serviceGroups = new Map<string, ServiceInstance[]>();

    // Group services by name
    allServices.forEach(service => {
      if (!serviceGroups.has(service.name)) {
        serviceGroups.set(service.name, []);
      }
      serviceGroups.get(service.name)!.push(service);
    });

    const serviceHealths = Array.from(serviceGroups.entries()).map(([name, instances]) => {
      const healthyInstances = instances.filter(instance => instance.status === 'healthy').length;
      const totalInstances = instances.length;
      
      let status = 'healthy';
      if (healthyInstances === 0) {
        status = 'unhealthy';
      } else if (healthyInstances < totalInstances) {
        status = 'degraded';
      }

      return {
        name,
        status,
        instances: totalInstances,
        healthyInstances
      };
    });

    // Determine overall status
    const unhealthyServices = serviceHealths.filter(s => s.status === 'unhealthy').length;
    const degradedServices = serviceHealths.filter(s => s.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyServices > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      services: serviceHealths
    };
  }
} 