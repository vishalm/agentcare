import { Logger } from "../utils/Logger";

/**
 * Interface for appointment entity
 */
export interface Appointment {
  id: string;
  doctorId: number;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateTime: Date;
  status: "scheduled" | "cancelled" | "completed" | "no_show";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing appointment operations
 */
export class AppointmentService {
  private logger: Logger;
  private appointments: Appointment[] = [];
  private nextId = 1;

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeMockData();
  }

  /**
   * Initialize mock data for demo purposes
   */
  private initializeMockData(): void {
    const mockAppointments: Appointment[] = [
      {
        id: "APT001",
        doctorId: 1,
        doctorName: "Dr. Sarah Johnson",
        patientName: "John Doe",
        patientEmail: "john.doe@email.com",
        patientPhone: "(555) 987-6543",
        dateTime: new Date("2025-05-26T09:00:00"),
        status: "scheduled",
        notes: "Regular checkup",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    this.appointments = mockAppointments;
    this.nextId = 2;
  }

  /**
   * Create a new appointment
   * @param appointmentData - The appointment data
   */
  public async create(appointmentData: any): Promise<Appointment> {
    this.logger.info("Creating new appointment", { appointmentData });

    const appointment: Appointment = {
      id: `APT${String(this.nextId++).padStart(3, "0")}`,
      doctorId: appointmentData.doctorId,
      doctorName:
        appointmentData.doctorName || `Doctor ${appointmentData.doctorId}`,
      patientName: appointmentData.patientName,
      patientEmail: appointmentData.patientEmail,
      patientPhone: appointmentData.patientPhone,
      dateTime: new Date(appointmentData.dateTime),
      status: "scheduled",
      notes: appointmentData.notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.appointments.push(appointment);
    return appointment;
  }

  /**
   * Find appointment by ID
   * @param id - The appointment ID
   */
  public async findById(id: string): Promise<Appointment | null> {
    this.logger.info("Finding appointment by ID", { id });
    return this.appointments.find((apt) => apt.id === id) || null;
  }

  /**
   * Get all appointments
   */
  public async findAll(): Promise<Appointment[]> {
    this.logger.info("Fetching all appointments");
    return [...this.appointments];
  }

  /**
   * Get appointments by doctor ID
   * @param doctorId - The doctor ID
   */
  public async findByDoctor(doctorId: number): Promise<Appointment[]> {
    this.logger.info("Finding appointments by doctor", { doctorId });
    return this.appointments.filter((apt) => apt.doctorId === doctorId);
  }

  /**
   * Get appointments by patient email
   * @param email - The patient email
   */
  public async findByPatient(email: string): Promise<Appointment[]> {
    this.logger.info("Finding appointments by patient", { email });
    return this.appointments.filter((apt) => apt.patientEmail === email);
  }

  /**
   * Cancel an appointment
   * @param id - The appointment ID
   */
  public async cancel(id: string): Promise<Appointment> {
    this.logger.info("Cancelling appointment", { id });
    const appointment = await this.findById(id);

    if (!appointment) {
      throw new Error(`Appointment ${id} not found`);
    }

    appointment.status = "cancelled";
    appointment.updatedAt = new Date();

    return appointment;
  }

  /**
   * Reschedule an appointment
   * @param details - The rescheduling details
   */
  public async reschedule(details: any): Promise<Appointment> {
    this.logger.info("Rescheduling appointment", { details });
    const appointment = await this.findById(details.appointmentId);

    if (!appointment) {
      throw new Error(`Appointment ${details.appointmentId} not found`);
    }

    appointment.dateTime = new Date(details.newDateTime);
    appointment.updatedAt = new Date();

    return appointment;
  }

  /**
   * Get available slots for a doctor
   * @param doctorId - The doctor ID
   * @param startDate - Start date for availability check
   * @param endDate - End date for availability check
   */
  public async getAvailableSlots(
    doctorId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Date[]> {
    this.logger.info("Getting available slots", {
      doctorId,
      startDate,
      endDate,
    });

    // Mock implementation - generate available slots
    const slots: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Generate slots for business hours (9 AM to 5 PM)
      for (let hour = 9; hour < 17; hour++) {
        const slotTime = new Date(current);
        slotTime.setHours(hour, 0, 0, 0);

        // Check if slot is already booked
        const isBooked = this.appointments.some(
          (apt) =>
            apt.doctorId === doctorId &&
            apt.status === "scheduled" &&
            apt.dateTime.getTime() === slotTime.getTime(),
        );

        if (!isBooked && slotTime > new Date()) {
          slots.push(new Date(slotTime));
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return slots.slice(0, 10); // Return first 10 available slots
  }

  /**
   * Update appointment status
   * @param id - The appointment ID
   * @param status - The new status
   */
  public async updateStatus(
    id: string,
    status: Appointment["status"],
  ): Promise<Appointment> {
    this.logger.info("Updating appointment status", { id, status });
    const appointment = await this.findById(id);

    if (!appointment) {
      throw new Error(`Appointment ${id} not found`);
    }

    appointment.status = status;
    appointment.updatedAt = new Date();

    return appointment;
  }
}
