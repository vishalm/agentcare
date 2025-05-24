import { IAgent } from './interfaces/IAgent';
import { Logger } from '../utils/Logger';
import { MetricsCollector } from '../utils/MetricsCollector';
import { AvailabilityTools } from '../tools/AvailabilityTools';

/**
 * AvailabilityAgent handles checking and managing doctor availability
 * Implements the IAgent interface for consistent behavior
 */
export class AvailabilityAgent implements IAgent {
    private readonly logger: Logger;
    private readonly metrics: MetricsCollector;
    private readonly tools: AvailabilityTools;
    private isActive: boolean = false;

    constructor(
        logger: Logger,
        metrics: MetricsCollector,
        tools: AvailabilityTools
    ) {
        this.logger = logger;
        this.metrics = metrics;
        this.tools = tools;
    }

    /**
     * Process availability requests
     * @param message - The user's availability request
     * @param intent - The parsed intent from the supervisor agent
     * @returns Promise<string> - The agent's response
     */
    public async process(message: string, intent?: any): Promise<string> {
        try {
            this.isActive = true;
            this.metrics.startOperation('availability_process');
            this.logger.info('AvailabilityAgent processing request', { message, intent });

            // Activate relevant tools
            await this.tools.activate(['checkAvailability', 'filterBySpecialization']);

            // Parse the request to determine search criteria
            const searchCriteria = await this.tools.parseAvailabilityRequest(message);
            
            // Get available doctors based on criteria
            const availableDoctors = await this.tools.getAvailableDoctors(searchCriteria);

            if (availableDoctors.length === 0) {
                return "I couldn't find any available appointments matching your criteria. Would you like to:\n\n" +
                       '• Try a different date or time\n' +
                       '• Look for doctors in a different specialization\n' +
                       '• Get notified when slots become available';
            }

            // Format the response
            let response = 'Here are our available doctors and appointment slots:\n\n';
            
            for (const doctor of availableDoctors) {
                response += `**${doctor.name}** - ${doctor.specialization}\n`;
                response += `${doctor.credentials}\n`;
                response += 'Available times:\n';
                
                doctor.availableSlots.slice(0, 3).forEach((slot: Date) => {
                    const date = new Date(slot);
                    response += `• ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n`;
                });
                response += '\n';
            }
            
            response += 'Would you like to book with any of these doctors? Just let me know your preference!';

            this.metrics.endOperation('availability_process');
            return response;

        } catch (error) {
            this.logger.error('Error in AvailabilityAgent process', { error });
            this.metrics.recordError('availability_process');
            throw new Error('Failed to process availability request');
        } finally {
            this.isActive = false;
        }
    }

    /**
     * Check if the agent is currently active
     */
    public isAgentActive(): boolean {
        return this.isActive;
    }
} 