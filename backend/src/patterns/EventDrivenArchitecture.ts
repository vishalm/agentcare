/**
 * Event-Driven Architecture for AgentCare
 * Implements message queues, event sourcing, and CQRS patterns
 */

import { EventEmitter } from "events";

// Base Event Interface
export interface DomainEvent {
  id: string;
  aggregateId: string;
  eventType: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

// Healthcare-specific Events
export interface AppointmentScheduledEvent extends DomainEvent {
  eventType: "AppointmentScheduled";
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    scheduledTime: Date;
    duration: number;
    department: string;
  };
}

export interface AppointmentCancelledEvent extends DomainEvent {
  eventType: "AppointmentCancelled";
  data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    cancelledBy: string;
    reason: string;
    cancelledAt: Date;
  };
}

export interface PatientRegisteredEvent extends DomainEvent {
  eventType: "PatientRegistered";
  data: {
    patientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: Date;
    registeredAt: Date;
  };
}

export interface DoctorAvailabilityUpdatedEvent extends DomainEvent {
  eventType: "DoctorAvailabilityUpdated";
  data: {
    doctorId: string;
    availableSlots: Array<{
      startTime: Date;
      endTime: Date;
      isAvailable: boolean;
    }>;
    updatedBy: string;
    updatedAt: Date;
  };
}

// Event Store Interface
export interface EventStore {
  save(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
  getAllEvents(fromVersion?: number): Promise<DomainEvent[]>;
}

// In-Memory Event Store Implementation
export class InMemoryEventStore implements EventStore {
  private events: DomainEvent[] = [];
  private eventsByAggregate: Map<string, DomainEvent[]> = new Map();

  async save(event: DomainEvent): Promise<void> {
    this.events.push(event);

    if (!this.eventsByAggregate.has(event.aggregateId)) {
      this.eventsByAggregate.set(event.aggregateId, []);
    }
    this.eventsByAggregate.get(event.aggregateId)!.push(event);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.eventsByAggregate.get(aggregateId) || [];
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    return this.events.filter((event) => event.eventType === eventType);
  }

  async getAllEvents(fromVersion?: number): Promise<DomainEvent[]> {
    if (fromVersion !== undefined) {
      return this.events.filter((event) => event.version >= fromVersion);
    }
    return [...this.events];
  }
}

// Message Queue Interface
export interface MessageQueue {
  publish(topic: string, message: any): Promise<void>;
  subscribe(
    topic: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void>;
  unsubscribe(
    topic: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void>;
}

// Redis-based Message Queue Implementation
export class RedisMessageQueue implements MessageQueue {
  private subscriptions: Map<string, Array<(message: any) => Promise<void>>> =
    new Map();
  private emitter = new EventEmitter();

  async publish(topic: string, message: any): Promise<void> {
    // In a real implementation, this would use Redis pub/sub
    this.emitter.emit(topic, message);
  }

  async subscribe(
    topic: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void> {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, []);
    }
    this.subscriptions.get(topic)!.push(handler);

    this.emitter.on(topic, async (message: any) => {
      try {
        await handler(message);
      } catch (error) {
        console.error(`Error handling message for topic ${topic}:`, error);
      }
    });
  }

  async unsubscribe(
    topic: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void> {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
    this.emitter.removeListener(topic, handler);
  }
}

// Event Bus Implementation
export class EventBus {
  private static instance: EventBus;
  private eventStore: EventStore;
  private messageQueue: MessageQueue;
  private eventHandlers: Map<
    string,
    Array<(event: DomainEvent) => Promise<void>>
  > = new Map();

  constructor(eventStore: EventStore, messageQueue: MessageQueue) {
    this.eventStore = eventStore;
    this.messageQueue = messageQueue;
  }

  static getInstance(
    eventStore?: EventStore,
    messageQueue?: MessageQueue,
  ): EventBus {
    if (!EventBus.instance) {
      if (!eventStore || !messageQueue) {
        throw new Error(
          "EventStore and MessageQueue are required for first instantiation",
        );
      }
      EventBus.instance = new EventBus(eventStore, messageQueue);
    }
    return EventBus.instance;
  }

  async publishEvent(event: DomainEvent): Promise<void> {
    // Store event
    await this.eventStore.save(event);

    // Publish to message queue
    await this.messageQueue.publish(event.eventType, event);

    // Execute local handlers
    const handlers = this.eventHandlers.get(event.eventType) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  subscribe(
    eventType: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);

    // Also subscribe to message queue
    this.messageQueue.subscribe(eventType, handler);
  }

  async getEventHistory(aggregateId: string): Promise<DomainEvent[]> {
    return this.eventStore.getEvents(aggregateId);
  }
}

// Command Interface (CQRS Pattern)
export interface Command {
  id: string;
  type: string;
  aggregateId: string;
  data: any;
  metadata?: Record<string, any>;
}

// Healthcare-specific Commands
export interface ScheduleAppointmentCommand extends Command {
  type: "ScheduleAppointment";
  data: {
    patientId: string;
    doctorId: string;
    requestedTime: Date;
    duration: number;
    department: string;
    notes?: string;
  };
}

export interface CancelAppointmentCommand extends Command {
  type: "CancelAppointment";
  data: {
    appointmentId: string;
    cancelledBy: string;
    reason: string;
  };
}

// Command Handler Interface
export interface CommandHandler<T extends Command> {
  handle(command: T): Promise<DomainEvent[]>;
}

// Command Bus Implementation
export class CommandBus {
  private handlers: Map<string, CommandHandler<any>> = new Map();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  registerHandler<T extends Command>(
    commandType: string,
    handler: CommandHandler<T>,
  ): void {
    this.handlers.set(commandType, handler);
  }

  async execute<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(
        `No handler registered for command type: ${command.type}`,
      );
    }

    const events = await handler.handle(command);

    // Publish all resulting events
    for (const event of events) {
      await this.eventBus.publishEvent(event);
    }
  }
}

// Query Interface (CQRS Pattern)
export interface Query {
  id: string;
  type: string;
  parameters: any;
}

// Healthcare-specific Queries
export interface GetPatientAppointmentsQuery extends Query {
  type: "GetPatientAppointments";
  parameters: {
    patientId: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface GetDoctorAvailabilityQuery extends Query {
  type: "GetDoctorAvailability";
  parameters: {
    doctorId: string;
    date: Date;
    duration?: number;
  };
}

// Query Handler Interface
export interface QueryHandler<T extends Query, R> {
  handle(query: T): Promise<R>;
}

// Query Bus Implementation
export class QueryBus {
  private handlers: Map<string, QueryHandler<any, any>> = new Map();

  registerHandler<T extends Query, R>(
    queryType: string,
    handler: QueryHandler<T, R>,
  ): void {
    this.handlers.set(queryType, handler);
  }

  async execute<T extends Query, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.type}`);
    }

    return handler.handle(query);
  }
}

// Saga Pattern for Distributed Transactions
export interface SagaStep {
  execute(): Promise<void>;
  compensate(): Promise<void>;
}

export class Saga {
  private steps: SagaStep[] = [];
  private executedSteps: SagaStep[] = [];

  addStep(step: SagaStep): void {
    this.steps.push(step);
  }

  async execute(): Promise<void> {
    try {
      for (const step of this.steps) {
        await step.execute();
        this.executedSteps.push(step);
      }
    } catch (error) {
      // Compensate in reverse order
      for (let i = this.executedSteps.length - 1; i >= 0; i--) {
        try {
          await this.executedSteps[i].compensate();
        } catch (compensationError) {
          console.error("Compensation failed:", compensationError);
        }
      }
      throw error;
    }
  }
}

// Healthcare Appointment Scheduling Saga
export class AppointmentSchedulingSaga extends Saga {
  constructor(
    private patientId: string,
    private doctorId: string,
    private appointmentTime: Date,
    private duration: number,
  ) {
    super();
    this.setupSteps();
  }

  private setupSteps(): void {
    // Step 1: Check doctor availability
    this.addStep({
      execute: async () => {
        // Check if doctor is available
        console.log(`Checking availability for doctor ${this.doctorId}`);
      },
      compensate: async () => {
        // No compensation needed for check
      },
    });

    // Step 2: Reserve time slot
    this.addStep({
      execute: async () => {
        console.log(`Reserving time slot for ${this.appointmentTime}`);
      },
      compensate: async () => {
        console.log(`Releasing reserved time slot for ${this.appointmentTime}`);
      },
    });

    // Step 3: Create appointment
    this.addStep({
      execute: async () => {
        console.log(`Creating appointment for patient ${this.patientId}`);
      },
      compensate: async () => {
        console.log(`Cancelling appointment for patient ${this.patientId}`);
      },
    });

    // Step 4: Send confirmation
    this.addStep({
      execute: async () => {
        console.log(`Sending confirmation to patient ${this.patientId}`);
      },
      compensate: async () => {
        console.log(`Sending cancellation notice to patient ${this.patientId}`);
      },
    });
  }
}

// Factory for creating the complete event-driven architecture
export class EventDrivenArchitectureFactory {
  static create(): {
    eventBus: EventBus;
    commandBus: CommandBus;
    queryBus: QueryBus;
    eventStore: EventStore;
    messageQueue: MessageQueue;
  } {
    const eventStore = new InMemoryEventStore();
    const messageQueue = new RedisMessageQueue();
    const eventBus = EventBus.getInstance(eventStore, messageQueue);
    const commandBus = new CommandBus(eventBus);
    const queryBus = new QueryBus();

    return {
      eventBus,
      commandBus,
      queryBus,
      eventStore,
      messageQueue,
    };
  }
}
