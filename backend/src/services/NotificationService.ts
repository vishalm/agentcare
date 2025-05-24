import { Logger } from "../utils/Logger";
import { Appointment } from "./AppointmentService";

/**
 * Service for handling notifications (email, SMS, etc.)
 */
export class NotificationService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Send appointment confirmation notification
   * @param appointment - The appointment details
   */
  public async sendAppointmentConfirmation(
    appointment: Appointment,
  ): Promise<void> {
    this.logger.info("Sending appointment confirmation", {
      appointmentId: appointment.id,
    });

    // Mock implementation - in production this would send actual emails/SMS
    await this.mockEmailSend({
      to: appointment.patientEmail,
      subject: "Appointment Confirmation",
      body: `Dear ${appointment.patientName},\n\nYour appointment with ${appointment.doctorName} is confirmed for ${appointment.dateTime.toLocaleString()}.\n\nAppointment ID: ${appointment.id}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nAgentCare Team`,
    });
  }

  /**
   * Send appointment cancellation notification
   * @param appointment - The cancelled appointment details
   */
  public async sendAppointmentCancellation(
    appointment: Appointment,
  ): Promise<void> {
    this.logger.info("Sending appointment cancellation", {
      appointmentId: appointment.id,
    });

    await this.mockEmailSend({
      to: appointment.patientEmail,
      subject: "Appointment Cancelled",
      body: `Dear ${appointment.patientName},\n\nYour appointment with ${appointment.doctorName} scheduled for ${appointment.dateTime.toLocaleString()} has been cancelled.\n\nAppointment ID: ${appointment.id}\n\nIf you need to reschedule, please contact us.\n\nBest regards,\nAgentCare Team`,
    });
  }

  /**
   * Send appointment reschedule notification
   * @param appointment - The rescheduled appointment details
   */
  public async sendAppointmentReschedule(
    appointment: Appointment,
  ): Promise<void> {
    this.logger.info("Sending appointment reschedule notification", {
      appointmentId: appointment.id,
    });

    await this.mockEmailSend({
      to: appointment.patientEmail,
      subject: "Appointment Rescheduled",
      body: `Dear ${appointment.patientName},\n\nYour appointment with ${appointment.doctorName} has been rescheduled to ${appointment.dateTime.toLocaleString()}.\n\nAppointment ID: ${appointment.id}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nAgentCare Team`,
    });
  }

  /**
   * Send appointment reminder notification
   * @param appointment - The appointment details
   */
  public async sendAppointmentReminder(
    appointment: Appointment,
  ): Promise<void> {
    this.logger.info("Sending appointment reminder", {
      appointmentId: appointment.id,
    });

    await this.mockEmailSend({
      to: appointment.patientEmail,
      subject: "Appointment Reminder",
      body: `Dear ${appointment.patientName},\n\nThis is a reminder of your upcoming appointment with ${appointment.doctorName} on ${appointment.dateTime.toLocaleString()}.\n\nAppointment ID: ${appointment.id}\n\nPlease arrive 15 minutes early.\n\nBest regards,\nAgentCare Team`,
    });
  }

  /**
   * Mock email sending implementation
   * @param emailData - The email data
   */
  private async mockEmailSend(emailData: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.info("Email sent (mock)", {
      to: emailData.to,
      subject: emailData.subject,
      bodyLength: emailData.body.length,
    });
  }
}
