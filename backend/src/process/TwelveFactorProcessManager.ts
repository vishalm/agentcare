/**
 * 12-Factor Process Manager for AgentCare
 * Implements Factor 6 (Processes), Factor 8 (Concurrency), and Factor 9 (Disposability)
 */

import { EventEmitter } from 'events';
import { config12Factor } from '../config/TwelveFactorConfig';

export type ProcessType = 'web' | 'worker' | 'scheduler' | 'admin';

export interface ProcessDefinition {
  name: string;
  type: ProcessType;
  command: string;
  instances: number;
  environment: Record<string, string>;
  resources: {
    memory: string;
    cpu: string;
  };
}

export interface ProcessInstance {
  id: string;
  processType: ProcessType;
  pid?: number;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'crashed';
  startTime?: Date;
  stopTime?: Date;
  restartCount: number;
  lastError?: string;
}

/**
 * Factor 6: Execute app as stateless processes
 * Factor 8: Scale out via the process model
 * Factor 9: Maximize robustness with fast startup and graceful shutdown
 */
export class TwelveFactorProcessManager extends EventEmitter {
  private processes: Map<string, ProcessInstance> = new Map();
  private processDefinitions: Map<ProcessType, ProcessDefinition> = new Map();
  private shutdownInProgress = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.setupProcessDefinitions();
    this.setupGracefulShutdown();
    this.startHealthChecks();
  }

  /**
   * Factor 8: Define process types with scaling capabilities
   */
  private setupProcessDefinitions(): void {
    const config = config12Factor.getConfig();

    // Web processes - handle HTTP requests
    this.processDefinitions.set('web', {
      name: 'agentcare-web',
      type: 'web',
      command: 'node dist/web-server.js',
      instances: config.processes.web,
      environment: {
        PROCESS_TYPE: 'web',
        PORT: config.port.toString()
      },
      resources: {
        memory: '512Mi',
        cpu: '500m'
      }
    });

    // Worker processes - handle background jobs
    this.processDefinitions.set('worker', {
      name: 'agentcare-worker',
      type: 'worker',
      command: 'node dist/worker.js',
      instances: config.processes.worker,
      environment: {
        PROCESS_TYPE: 'worker',
        WORKER_CONCURRENCY: '5'
      },
      resources: {
        memory: '256Mi',
        cpu: '250m'
      }
    });

    // Scheduler processes - handle cron jobs
    this.processDefinitions.set('scheduler', {
      name: 'agentcare-scheduler',
      type: 'scheduler',
      command: 'node dist/scheduler.js',
      instances: config.processes.scheduler,
      environment: {
        PROCESS_TYPE: 'scheduler'
      },
      resources: {
        memory: '128Mi',
        cpu: '100m'
      }
    });
  }

  /**
   * Factor 6: Start stateless processes
   */
  async startProcess(processType: ProcessType): Promise<string[]> {
    const definition = this.processDefinitions.get(processType);
    if (!definition) {
      throw new Error(`Unknown process type: ${processType}`);
    }

    const processIds: string[] = [];

    for (let i = 0; i < definition.instances; i++) {
      const processId = `${definition.name}-${Date.now()}-${i}`;
      const instance: ProcessInstance = {
        id: processId,
        processType,
        status: 'starting',
        restartCount: 0
      };

      this.processes.set(processId, instance);
      
      try {
        // Factor 9: Fast startup
        await this.spawnProcess(instance, definition);
        instance.status = 'running';
        instance.startTime = new Date();
        
        this.emit('process:started', { processId, processType });
        processIds.push(processId);
        
        console.log(`Started process: ${processId} (${processType})`);
      } catch (error) {
        instance.status = 'crashed';
        instance.lastError = (error as Error).message;
        
        this.emit('process:failed', { processId, processType, error });
        console.error(`Failed to start process ${processId}:`, error);
      }
    }

    return processIds;
  }

  /**
   * Factor 9: Graceful shutdown
   */
  async stopProcess(processId: string, graceful = true): Promise<void> {
    const instance = this.processes.get(processId);
    if (!instance) {
      throw new Error(`Process not found: ${processId}`);
    }

    if (instance.status === 'stopped' || instance.status === 'stopping') {
      return;
    }

    instance.status = 'stopping';
    
    try {
      if (graceful) {
        await this.gracefulShutdown(instance);
      } else {
        await this.forceKill(instance);
      }
      
      instance.status = 'stopped';
      instance.stopTime = new Date();
      
      this.emit('process:stopped', { processId: instance.id, processType: instance.processType });
      console.log(`Stopped process: ${processId}`);
    } catch (error) {
      instance.status = 'crashed';
      instance.lastError = (error as Error).message;
      
      this.emit('process:failed', { processId, processType: instance.processType, error });
      console.error(`Failed to stop process ${processId}:`, error);
    }
  }

  /**
   * Factor 8: Scale process instances horizontally
   */
  async scaleProcess(processType: ProcessType, instances: number): Promise<void> {
    const definition = this.processDefinitions.get(processType);
    if (!definition) {
      throw new Error(`Unknown process type: ${processType}`);
    }

    const currentProcesses = Array.from(this.processes.values())
      .filter(p => p.processType === processType && p.status === 'running');

    const currentCount = currentProcesses.length;

    if (instances > currentCount) {
      // Scale up
      const toAdd = instances - currentCount;
      for (let i = 0; i < toAdd; i++) {
        await this.startProcess(processType);
      }
      
      this.emit('process:scaled', { processType, from: currentCount, to: instances, direction: 'up' });
      console.log(`Scaled up ${processType}: ${currentCount} -> ${instances}`);
    } else if (instances < currentCount) {
      // Scale down
      const toRemove = currentCount - instances;
      const processesToStop = currentProcesses.slice(0, toRemove);
      
      await Promise.all(processesToStop.map(p => this.stopProcess(p.id, true)));
      
      this.emit('process:scaled', { processType, from: currentCount, to: instances, direction: 'down' });
      console.log(`Scaled down ${processType}: ${currentCount} -> ${instances}`);
    }

    // Update definition
    definition.instances = instances;
  }

  /**
   * Factor 9: Health monitoring
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const instance of this.processes.values()) {
      if (instance.status === 'running') {
        try {
          const isHealthy = await this.checkProcessHealth(instance);
          if (!isHealthy) {
            console.warn(`Process ${instance.id} failed health check`);
            await this.restartProcess(instance);
          }
        } catch (error) {
          console.error(`Health check error for process ${instance.id}:`, error);
        }
      }
    }
  }

  private async checkProcessHealth(instance: ProcessInstance): Promise<boolean> {
    // In a real implementation, this would check process status
    // For now, simulate health check
    if (instance.pid) {
      try {
        // Check if process is still running
        process.kill(instance.pid, 0);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Factor 9: Process restart with exponential backoff
   */
  private async restartProcess(instance: ProcessInstance): Promise<void> {
    const maxRestarts = 5;
    const baseDelay = 1000; // 1 second

    if (instance.restartCount >= maxRestarts) {
      console.error(`Process ${instance.id} exceeded max restart attempts`);
      instance.status = 'crashed';
      return;
    }

    const delay = baseDelay * Math.pow(2, instance.restartCount);
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await this.stopProcess(instance.id, false);
      
      const definition = this.processDefinitions.get(instance.processType);
      if (definition) {
        await this.spawnProcess(instance, definition);
        instance.status = 'running';
        instance.startTime = new Date();
        instance.restartCount++;
        
        this.emit('process:restarted', { 
          processId: instance.id, 
          processType: instance.processType,
          restartCount: instance.restartCount 
        });
        
        console.log(`Restarted process: ${instance.id} (attempt ${instance.restartCount})`);
      }
    } catch (error) {
      instance.status = 'crashed';
      instance.lastError = (error as Error).message;
      console.error(`Failed to restart process ${instance.id}:`, error);
    }
  }

  /**
   * Factor 9: Graceful shutdown implementation
   */
  private setupGracefulShutdown(): void {
    const shutdownSignals = ['SIGINT', 'SIGTERM', 'SIGUSR2'];
    
    shutdownSignals.forEach(signal => {
      process.on(signal, async () => {
        if (this.shutdownInProgress) return;
        
        console.log(`Received ${signal}, starting graceful shutdown...`);
        this.shutdownInProgress = true;
        
        try {
          await this.shutdown();
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    });
  }

  /**
   * Factor 9: Graceful shutdown of all processes
   */
  async shutdown(): Promise<void> {
    const config = config12Factor.getConfig();
    const shutdownTimeout = config.gracefulShutdown.timeout;
    
    console.log(`Starting graceful shutdown (timeout: ${shutdownTimeout}ms)...`);
    
    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Get all running processes
    const runningProcesses = Array.from(this.processes.values())
      .filter(p => p.status === 'running' || p.status === 'starting');

    if (runningProcesses.length === 0) {
      console.log('No processes to shutdown');
      return;
    }

    // Stop processes with timeout
    const shutdownPromise = Promise.all(
      runningProcesses.map(p => this.stopProcess(p.id, true))
    );

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Shutdown timeout exceeded'));
      }, shutdownTimeout);
    });

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      console.log('All processes stopped gracefully');
    } catch (error) {
      console.warn('Graceful shutdown timeout, forcing kill...');
      
      // Force kill remaining processes
      await Promise.all(
        runningProcesses.map(p => this.stopProcess(p.id, false))
      );
    }
  }

  /**
   * Get process status for monitoring
   */
  getProcessStatus(): {
    total: number;
    running: number;
    stopped: number;
    crashed: number;
    byType: Record<ProcessType, number>;
  } {
    const processes = Array.from(this.processes.values());
    const byStatus = processes.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = processes.reduce((acc, p) => {
      if (p.status === 'running') {
        acc[p.processType] = (acc[p.processType] || 0) + 1;
      }
      return acc;
    }, {} as Record<ProcessType, number>);

    return {
      total: processes.length,
      running: byStatus.running || 0,
      stopped: byStatus.stopped || 0,
      crashed: byStatus.crashed || 0,
      byType
    };
  }

  /**
   * Simulate process spawning (in real implementation, use child_process)
   */
  private async spawnProcess(instance: ProcessInstance, definition: ProcessDefinition): Promise<void> {
    // Simulate process startup time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate PID assignment
    instance.pid = Math.floor(Math.random() * 90000) + 10000;
    
    console.log(`Spawned process: ${instance.id} with PID: ${instance.pid}`);
  }

  /**
   * Graceful shutdown of a single process
   */
  private async gracefulShutdown(instance: ProcessInstance): Promise<void> {
    const config = config12Factor.getConfig();
    
    if (instance.pid) {
      // Send SIGTERM for graceful shutdown
      try {
        process.kill(instance.pid, 'SIGTERM');
        
        // Wait for graceful shutdown
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Graceful shutdown timeout'));
          }, config.gracefulShutdown.killTimeout);
          
          // Simulate process exit
          setTimeout(() => {
            clearTimeout(timeout);
            resolve(undefined);
          }, 1000);
        });
      } catch (error) {
        console.warn(`Graceful shutdown failed for ${instance.id}, forcing kill`);
        await this.forceKill(instance);
      }
    }
  }

  /**
   * Force kill a process
   */
  private async forceKill(instance: ProcessInstance): Promise<void> {
    if (instance.pid) {
      try {
        process.kill(instance.pid, 'SIGKILL');
        console.log(`Force killed process: ${instance.id}`);
      } catch (error) {
        console.error(`Failed to kill process ${instance.id}:`, error);
      }
    }
  }
}

// Factor 12: Admin process utilities
export class AdminProcessRunner {
  private static instance: AdminProcessRunner;
  private config = config12Factor.getAdminConfig();

  static getInstance(): AdminProcessRunner {
    if (!AdminProcessRunner.instance) {
      AdminProcessRunner.instance = new AdminProcessRunner();
    }
    return AdminProcessRunner.instance;
  }

  /**
   * Factor 12: Run admin/management tasks as one-off processes
   */
  async runAdminCommand(command: string, args: string[] = []): Promise<{
    success: boolean;
    output: string;
    error?: string;
    executionTime: number;
  }> {
    const startTime = Date.now();
    
    if (!this.config.allowedCommands.includes(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    if (this.config.auditLogging) {
      console.log(`Admin command executed: ${command} ${args.join(' ')}`);
    }

    try {
      // Simulate command execution with timeout
      const result = await Promise.race([
        this.executeCommand(command, args),
        this.timeoutPromise()
      ]);

      const executionTime = Date.now() - startTime;
      
      if (this.config.auditLogging) {
        console.log(`Admin command completed: ${command} (${executionTime}ms)`);
      }

      return {
        success: true,
        output: result,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = (error as Error).message;
      
      if (this.config.auditLogging) {
        console.error(`Admin command failed: ${command} - ${errorMessage}`);
      }

      return {
        success: false,
        output: '',
        error: errorMessage,
        executionTime
      };
    }
  }

  private async executeCommand(command: string, args: string[]): Promise<string> {
    // Simulate different admin commands
    switch (command) {
      case 'migrate':
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'Database migration completed';
      
      case 'seed':
        await new Promise(resolve => setTimeout(resolve, 1500));
        return 'Database seeded with initial data';
      
      case 'backup':
        await new Promise(resolve => setTimeout(resolve, 5000));
        return 'Database backup created';
      
      case 'restore':
        await new Promise(resolve => setTimeout(resolve, 3000));
        return 'Database restored from backup';
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Command timeout after ${this.config.maxExecutionTime}ms`));
      }, this.config.maxExecutionTime);
    });
  }
}

export const processManager = new TwelveFactorProcessManager();
export const adminRunner = AdminProcessRunner.getInstance(); 