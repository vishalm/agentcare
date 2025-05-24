import { Logger } from "../utils/Logger";
import { Appointment } from "./AppointmentService";

/**
 * Service for handling email operations
 */
export class EmailService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Send confirmation email
   * @param appointment - The appointment details
   */
  public async sendConfirmation(appointment: Appointment): Promise<void> {
    this.logger.info("Sending confirmation email", {
      appointmentId: appointment.id,
    });

    await this.sendEmail({
      to: appointment.patientEmail,
      subject: "Appointment Confirmation - AgentCare",
      html: this.generateConfirmationHTML(appointment),
    });
  }

  /**
   * Send cancellation email
   * @param appointment - The cancelled appointment details
   */
  public async sendCancellation(appointment: Appointment): Promise<void> {
    this.logger.info("Sending cancellation email", {
      appointmentId: appointment.id,
    });

    await this.sendEmail({
      to: appointment.patientEmail,
      subject: "Appointment Cancelled - AgentCare",
      html: this.generateCancellationHTML(appointment),
    });
  }

  /**
   * Send reschedule email
   * @param appointment - The rescheduled appointment details
   */
  public async sendReschedule(appointment: Appointment): Promise<void> {
    this.logger.info("Sending reschedule email", {
      appointmentId: appointment.id,
    });

    await this.sendEmail({
      to: appointment.patientEmail,
      subject: "Appointment Rescheduled - AgentCare",
      html: this.generateRescheduleHTML(appointment),
    });
  }

  /**
   * Generate confirmation email HTML
   * @param appointment - The appointment details
   */
  private generateConfirmationHTML(appointment: Appointment): string {
    return `
            <h2>Appointment Confirmed</h2>
            <p>Dear ${appointment.patientName},</p>
            <p>Your appointment has been confirmed with the following details:</p>
            <ul>
                <li><strong>Doctor:</strong> ${appointment.doctorName}</li>
                <li><strong>Date & Time:</strong> ${appointment.dateTime.toLocaleString()}</li>
                <li><strong>Appointment ID:</strong> ${appointment.id}</li>
            </ul>
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>Best regards,<br>AgentCare Team</p>
        `;
  }

  /**
   * Generate cancellation email HTML
   * @param appointment - The cancelled appointment details
   */
  private generateCancellationHTML(appointment: Appointment): string {
    return `
            <h2>Appointment Cancelled</h2>
            <p>Dear ${appointment.patientName},</p>
            <p>Your appointment has been cancelled:</p>
            <ul>
                <li><strong>Doctor:</strong> ${appointment.doctorName}</li>
                <li><strong>Date & Time:</strong> ${appointment.dateTime.toLocaleString()}</li>
                <li><strong>Appointment ID:</strong> ${appointment.id}</li>
            </ul>
            <p>If you need to reschedule, please contact us.</p>
            <p>Best regards,<br>AgentCare Team</p>
        `;
  }

  /**
   * Generate reschedule email HTML
   * @param appointment - The rescheduled appointment details
   */
  private generateRescheduleHTML(appointment: Appointment): string {
    return `
            <h2>Appointment Rescheduled</h2>
            <p>Dear ${appointment.patientName},</p>
            <p>Your appointment has been rescheduled:</p>
            <ul>
                <li><strong>Doctor:</strong> ${appointment.doctorName}</li>
                <li><strong>New Date & Time:</strong> ${appointment.dateTime.toLocaleString()}</li>
                <li><strong>Appointment ID:</strong> ${appointment.id}</li>
            </ul>
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>Best regards,<br>AgentCare Team</p>
        `;
  }

  /**
   * Send email (mock implementation)
   * @param emailData - The email data
   */
  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    // Mock implementation - in production this would use a real email service
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.info("Email sent", {
      to: emailData.to,
      subject: emailData.subject,
    });
  }
}
