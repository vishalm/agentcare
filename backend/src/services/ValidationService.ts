import { Logger } from "../utils/Logger";

/**
 * Service for validating data across the system
 */
export class ValidationService {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Validate booking details
   * @param details - The booking details to validate
   */
  public async validateBooking(
    details: any,
  ): Promise<{ isValid: boolean; message?: string }> {
    this.logger.info("Validating booking details", { details });

    // Validate required fields
    if (!details.doctorId) {
      return { isValid: false, message: "Doctor ID is required" };
    }

    if (!details.patientName) {
      return { isValid: false, message: "Patient name is required" };
    }

    if (!details.patientEmail) {
      return { isValid: false, message: "Patient email is required" };
    }

    if (!details.dateTime) {
      return {
        isValid: false,
        message: "Appointment date and time is required",
      };
    }

    // Validate email format
    if (!this.isValidEmail(details.patientEmail)) {
      return { isValid: false, message: "Invalid email format" };
    }

    // Validate phone format (if provided)
    if (details.patientPhone && !this.isValidPhone(details.patientPhone)) {
      return { isValid: false, message: "Invalid phone number format" };
    }

    // Validate appointment date is in the future
    const appointmentDate = new Date(details.dateTime);
    if (appointmentDate <= new Date()) {
      return {
        isValid: false,
        message: "Appointment date must be in the future",
      };
    }

    // Validate appointment is during business hours
    const hour = appointmentDate.getHours();
    if (hour < 9 || hour >= 17) {
      return {
        isValid: false,
        message: "Appointments must be scheduled between 9 AM and 5 PM",
      };
    }

    // Validate appointment is not on weekends
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        isValid: false,
        message: "Appointments cannot be scheduled on weekends",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate email format
   * @param email - The email to validate
   */
  public isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param phone - The phone number to validate
   */
  public isValidPhone(phone: string): boolean {
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, "");

    // Check if it's 10 or 11 digits (US format)
    return digitsOnly.length === 10 || digitsOnly.length === 11;
  }

  /**
   * Validate doctor data
   * @param doctorData - The doctor data to validate
   */
  public async validateDoctor(
    doctorData: any,
  ): Promise<{ isValid: boolean; message?: string }> {
    this.logger.info("Validating doctor data", { doctorData });

    if (!doctorData.name) {
      return { isValid: false, message: "Doctor name is required" };
    }

    if (!doctorData.specialization) {
      return { isValid: false, message: "Specialization is required" };
    }

    if (!doctorData.email) {
      return { isValid: false, message: "Email is required" };
    }

    if (!this.isValidEmail(doctorData.email)) {
      return { isValid: false, message: "Invalid email format" };
    }

    if (doctorData.phone && !this.isValidPhone(doctorData.phone)) {
      return { isValid: false, message: "Invalid phone number format" };
    }

    return { isValid: true };
  }

  /**
   * Validate FAQ data
   * @param faqData - The FAQ data to validate
   */
  public async validateFAQ(
    faqData: any,
  ): Promise<{ isValid: boolean; message?: string }> {
    this.logger.info("Validating FAQ data", { faqData });

    if (!faqData.category) {
      return { isValid: false, message: "Category is required" };
    }

    if (!faqData.question) {
      return { isValid: false, message: "Question is required" };
    }

    if (!faqData.answer) {
      return { isValid: false, message: "Answer is required" };
    }

    if (faqData.question.length < 10) {
      return {
        isValid: false,
        message: "Question must be at least 10 characters long",
      };
    }

    if (faqData.answer.length < 20) {
      return {
        isValid: false,
        message: "Answer must be at least 20 characters long",
      };
    }

    return { isValid: true };
  }

  /**
   * Sanitize user input
   * @param input - The input to sanitize
   */
  public sanitizeInput(input: string): string {
    if (!input) return "";

    // Remove script tags and their content first
    let sanitized = input.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );

    // Remove all other HTML tags
    sanitized = sanitized.replace(/<[^>]*>?/gm, "");

    // Trim whitespace
    return sanitized.trim();
  }
}
