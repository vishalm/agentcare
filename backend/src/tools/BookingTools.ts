import { Logger } from '../utils/Logger';
import { EmailService } from '../services/EmailService';
import { AppointmentService } from '../services/AppointmentService';
import { ValidationService } from '../services/ValidationService';
import { NotificationService } from '../services/NotificationService';

/**
 * Specialized tools for handling booking operations
 * Provides methods for appointment creation, cancellation, and rescheduling
 */
export class BookingTools {
    private activeTools: Set<string> = new Set();
    private readonly logger: Logger;
    private readonly emailService: EmailService;
    private readonly appointmentService: AppointmentService;
    private readonly validationService: ValidationService;
    private readonly notificationService: NotificationService;

    constructor(
        logger: Logger,
        emailService: EmailService,
        appointmentService: AppointmentService,
        validationService: ValidationService,
        notificationService: NotificationService
    ) {
        this.logger = logger;
        this.emailService = emailService;
        this.appointmentService = appointmentService;
        this.validationService = validationService;
        this.notificationService = notificationService;
    }

    /**
     * Activate specific tools for the current operation
     * @param tools - Array of tool names to activate
     */
    public async activate(tools: string[]): Promise<void> {
        this.activeTools = new Set(tools);
        this.logger.info('BookingTools activated', { tools });
    }

    /**
     * Parse booking request to determine action type
     * @param message - The user's booking request
     */
    public async parseBookingRequest(message: string): Promise<any> {
        this.validateToolActive('createAppointment');
        const lower = message.toLowerCase();
        
        if (lower.includes('cancel') || lower.includes('remove')) {
            return { type: 'cancel' };
        }
        if (lower.includes('reschedule') || lower.includes('change time')) {
            return { type: 'reschedule' };
        }
        if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment')) {
            return { type: 'create' };
        }
        
        return { type: 'unknown' };
    }

    /**
     * Extract booking details from user message
     * @param message - The user's message
     */
    public async extractBookingDetails(message: string): Promise<any> {
        this.validateToolActive('createAppointment');
        // Implementation would use NLP to extract details
        return {
            doctorId: null,
            dateTime: null,
            patientName: '',
            patientEmail: '',
            patientPhone: ''
        };
    }

    /**
     * Validate booking details before creation
     * @param details - The parsed booking details
     */
    public async validateBookingDetails(details: any): Promise<{ isValid: boolean; message?: string }> {
        this.validateToolActive('validateBookingDetails');
        return this.validationService.validateBooking(details);
    }

    /**
     * Create a new appointment
     * @param details - The booking details
     */
    public async createAppointment(details: any): Promise<any> {
        this.validateToolActive('createAppointment');
        return this.appointmentService.create(details);
    }

    /**
     * Extract appointment ID from user message
     * @param message - The user's message
     */
    public async extractAppointmentId(message: string): Promise<string | null> {
        this.validateToolActive('createAppointment');
        // Implementation would use NLP to extract ID
        return null;
    }

    /**
     * Cancel an existing appointment
     * @param appointmentId - The ID of the appointment to cancel
     */
    public async cancelAppointment(appointmentId: string): Promise<any> {
        this.validateToolActive('createAppointment');
        return this.appointmentService.cancel(appointmentId);
    }

    /**
     * Extract rescheduling details from user message
     * @param message - The user's message
     */
    public async extractRescheduleDetails(message: string): Promise<any> {
        this.validateToolActive('createAppointment');
        // Implementation would use NLP to extract details
        return {
            appointmentId: null,
            newDateTime: null
        };
    }

    /**
     * Reschedule an existing appointment
     * @param details - The rescheduling details
     */
    public async rescheduleAppointment(details: any): Promise<any> {
        this.validateToolActive('createAppointment');
        return this.appointmentService.reschedule(details);
    }

    /**
     * Send appointment confirmation
     * @param appointment - The appointment details
     */
    public async sendConfirmation(appointment: any): Promise<void> {
        this.validateToolActive('sendConfirmation');
        await this.notificationService.sendAppointmentConfirmation(appointment);
    }

    /**
     * Send confirmation email for new appointment
     * @param appointment - The created appointment details
     */
    public async sendConfirmationEmail(appointment: any): Promise<void> {
        this.validateToolActive('sendConfirmationEmail');
        await this.emailService.sendConfirmation(appointment);
    }

    /**
     * Send cancellation email
     * @param appointment - The cancelled appointment details
     */
    public async sendCancellationEmail(appointment: any): Promise<void> {
        this.validateToolActive('sendCancellationEmail');
        await this.emailService.sendCancellation(appointment);
    }

    /**
     * Send reschedule email
     * @param appointment - The rescheduled appointment details
     */
    public async sendRescheduleEmail(appointment: any): Promise<void> {
        this.validateToolActive('sendRescheduleEmail');
        await this.emailService.sendReschedule(appointment);
    }

    /**
     * Validate that a tool is active before use
     * @param toolName - The name of the tool to validate
     */
    private validateToolActive(toolName: string): void {
        if (!this.activeTools.has(toolName)) {
            throw new Error(`Tool ${toolName} is not active`);
        }
    }
} 