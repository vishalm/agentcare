import { Logger } from '../utils/Logger';
import { DoctorService } from '../services/DoctorService';
import { AppointmentService } from '../services/AppointmentService';

/**
 * Specialized tools for handling availability operations
 * Provides methods for checking and managing doctor availability
 */
export class AvailabilityTools {
    private activeTools: Set<string> = new Set();
    private readonly logger: Logger;
    private readonly doctorService: DoctorService;
    private readonly appointmentService: AppointmentService;

    constructor(
        logger: Logger,
        doctorService: DoctorService,
        appointmentService: AppointmentService
    ) {
        this.logger = logger;
        this.doctorService = doctorService;
        this.appointmentService = appointmentService;
    }

    /**
     * Activate specific tools for the current operation
     * @param tools - Array of tool names to activate
     */
    public async activate(tools: string[]): Promise<void> {
        this.activeTools = new Set(tools);
        this.logger.info('AvailabilityTools activated', { tools });
    }

    /**
     * Parse availability request to extract search criteria
     * @param _message - The user's availability request (unused but kept for interface consistency)
     */
    public async parseAvailabilityRequest(_message: string): Promise<any> {
        this.validateToolActive('checkAvailability');
        // Implementation would use NLP to extract search criteria
        return {
            specialization: '',
            dateRange: {
                start: new Date(),
                end: new Date()
            },
            timePreference: ''
        };
    }

    /**
     * Get available doctors based on search criteria
     * @param criteria - The search criteria
     */
    public async getAvailableDoctors(criteria: any): Promise<any[]> {
        this.validateToolActive('checkAvailability');
        
        // Get doctors matching specialization
        const doctors = await this.doctorService.findBySpecialization(criteria.specialization);
        
        // Get available slots for each doctor
        const availableDoctors = await Promise.all(
            doctors.map(async (doctor) => {
                const availableSlots = await this.appointmentService.getAvailableSlots(
                    doctor.id,
                    criteria.dateRange.start,
                    criteria.dateRange.end
                );
                
                return {
                    ...doctor,
                    availableSlots
                };
            })
        );

        // Filter out doctors with no available slots
        return availableDoctors.filter(doctor => doctor.availableSlots.length > 0);
    }

    /**
     * Filter doctors by specialization
     * @param doctors - List of doctors to filter
     * @param specialization - The specialization to filter by
     */
    public async filterBySpecialization(doctors: any[], specialization: string): Promise<any[]> {
        this.validateToolActive('filterBySpecialization');
        return doctors.filter(doctor => 
            doctor.specialization.toLowerCase() === specialization.toLowerCase()
        );
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