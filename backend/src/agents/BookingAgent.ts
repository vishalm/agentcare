import { IAgent } from "./interfaces/IAgent";
import { Logger } from "../utils/Logger";
import { MetricsCollector } from "../utils/MetricsCollector";
import { BookingTools } from "../tools/BookingTools";

/**
 * BookingAgent handles appointment booking, cancellation, and rescheduling
 * Implements the IAgent interface for consistent behavior
 */
export class BookingAgent implements IAgent {
  private readonly logger: Logger;
  private readonly metrics: MetricsCollector;
  private readonly tools: BookingTools;
  private isActive: boolean = false;

  constructor(logger: Logger, metrics: MetricsCollector, tools: BookingTools) {
    this.logger = logger;
    this.metrics = metrics;
    this.tools = tools;
  }

  /**
   * Process booking-related requests
   * @param message - The user's booking request
   * @param intent - The parsed intent from the supervisor agent
   * @returns Promise<string> - The agent's response
   */
  public async process(message: string, intent: any): Promise<string> {
    try {
      this.isActive = true;
      this.metrics.startOperation("booking_process");
      this.logger.info("BookingAgent processing request", { message, intent });

      // Activate relevant tools
      await this.tools.activate(["createAppointment", "sendConfirmation"]);

      // Parse the request to determine booking action
      const bookingAction = await this.tools.parseBookingRequest(message);

      let response: string;
      switch (bookingAction.type) {
        case "create":
          response = await this.handleCreateBooking(message, bookingAction);
          break;
        case "cancel":
          response = await this.handleCancelBooking(message, bookingAction);
          break;
        case "reschedule":
          response = await this.handleRescheduleBooking(message, bookingAction);
          break;
        default:
          response = this.handleInvalidRequest();
      }

      this.metrics.endOperation("booking_process");
      return response;
    } catch (error) {
      this.logger.error("Error in BookingAgent process", { error });
      this.metrics.recordError("booking_process");
      throw new Error("Failed to process booking request");
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Handle appointment creation
   * @param message - The user's message
   * @param _action - The parsed booking action (unused but kept for interface consistency)
   */
  private async handleCreateBooking(
    message: string,
    _action: any,
  ): Promise<string> {
    const bookingDetails = await this.tools.extractBookingDetails(message);

    // Validate booking details
    if (!bookingDetails.doctorId || !bookingDetails.dateTime) {
      return (
        "I need a bit more information to book your appointment. Please specify:\n" +
        "• Which doctor you'd like to see\n" +
        "• Your preferred date and time"
      );
    }

    // Create the appointment
    const appointment = await this.tools.createAppointment(bookingDetails);

    // Send confirmation
    await this.tools.sendConfirmation(appointment);

    return (
      `Great! I've booked your appointment with Dr. ${appointment.doctorName} on ` +
      `${new Date(appointment.dateTime).toLocaleString()}.\n\n` +
      `A confirmation email has been sent to ${appointment.patientEmail}.\n\n` +
      `Appointment ID: ${appointment.id}\n` +
      "Please arrive 15 minutes before your scheduled time."
    );
  }

  /**
   * Handle appointment cancellation
   * @param message - The user's message
   * @param _action - The parsed booking action (unused but kept for interface consistency)
   */
  private async handleCancelBooking(
    message: string,
    _action: any,
  ): Promise<string> {
    const appointmentId = await this.tools.extractAppointmentId(message);

    if (!appointmentId) {
      return (
        "I couldn't find the appointment you want to cancel. Please provide:\n" +
        "• Your appointment ID, or\n" +
        "• The doctor's name and appointment date"
      );
    }

    const cancelled = await this.tools.cancelAppointment(appointmentId);

    return (
      `I've cancelled your appointment with Dr. ${cancelled.doctorName} ` +
      `scheduled for ${new Date(cancelled.dateTime).toLocaleString()}.\n\n` +
      `A cancellation confirmation has been sent to ${cancelled.patientEmail}.`
    );
  }

  /**
   * Handle appointment rescheduling
   * @param message - The user's message
   * @param _action - The parsed booking action (unused but kept for interface consistency)
   */
  private async handleRescheduleBooking(
    message: string,
    _action: any,
  ): Promise<string> {
    const rescheduleDetails =
      await this.tools.extractRescheduleDetails(message);

    if (!rescheduleDetails.appointmentId || !rescheduleDetails.newDateTime) {
      return (
        "I need more information to reschedule your appointment. Please provide:\n" +
        "• Your appointment ID\n" +
        "• Your preferred new date and time"
      );
    }

    const rescheduled =
      await this.tools.rescheduleAppointment(rescheduleDetails);

    return (
      `I've rescheduled your appointment with Dr. ${rescheduled.doctorName} ` +
      `to ${new Date(rescheduled.dateTime).toLocaleString()}.\n\n` +
      `A confirmation email has been sent to ${rescheduled.patientEmail}.\n\n` +
      `Appointment ID: ${rescheduled.id}`
    );
  }

  /**
   * Handle invalid booking requests
   */
  private handleInvalidRequest(): string {
    return (
      "I'm not sure what you'd like to do with your appointment. I can help you:\n\n" +
      "• Book a new appointment\n" +
      "• Cancel an existing appointment\n" +
      "• Reschedule an appointment\n\n" +
      "Please let me know what you'd like to do!"
    );
  }

  /**
   * Check if the agent is currently active
   */
  public isAgentActive(): boolean {
    return this.isActive;
  }
}
