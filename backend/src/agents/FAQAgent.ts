import { IAgent } from "./interfaces/IAgent";
import { Logger } from "../utils/Logger";
import { MetricsCollector } from "../utils/MetricsCollector";
import { FAQTools } from "../tools/FAQTools";

/**
 * FAQAgent handles information requests about doctors, services, and policies
 * Implements the IAgent interface for consistent behavior
 */
export class FAQAgent implements IAgent {
  private readonly logger: Logger;
  private readonly metrics: MetricsCollector;
  private readonly tools: FAQTools;
  private isActive: boolean = false;

  constructor(logger: Logger, metrics: MetricsCollector, tools: FAQTools) {
    this.logger = logger;
    this.metrics = metrics;
    this.tools = tools;
  }

  /**
   * Process information requests
   * @param message - The user's information request
   * @param intent - The parsed intent from the supervisor agent
   * @returns Promise<string> - The agent's response
   */
  public async process(message: string, intent: any): Promise<string> {
    try {
      this.isActive = true;
      this.metrics.startOperation("faq_process");
      this.logger.info("FAQAgent processing request", { message, intent });

      // Activate relevant tools
      await this.tools.activate(["faqDatabase", "doctorCredentials"]);

      // Parse the request to determine information type
      const infoType = await this.tools.parseInformationRequest(message);

      let response: string;
      switch (infoType) {
        case "doctor":
          response = await this.handleDoctorInfo(message);
          break;
        case "preparation":
          response = await this.handlePreparationInfo();
          break;
        case "policy":
          response = await this.handlePolicyInfo();
          break;
        case "location":
          response = await this.handleLocationInfo();
          break;
        default:
          response = await this.handleGeneralInfo();
      }

      this.metrics.endOperation("faq_process");
      return response;
    } catch (error) {
      this.logger.error("Error in FAQAgent process", { error });
      this.metrics.recordError("faq_process");
      throw new Error("Failed to process information request");
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Handle requests for doctor information
   * @param message - The user's message
   */
  private async handleDoctorInfo(message: string): Promise<string> {
    const doctors = await this.tools.getDoctorInformation(message);

    let response = "**Our Medical Team:**\n\n";
    doctors.forEach((doctor) => {
      response += `**${doctor.name}**\n`;
      response += `• Specialization: ${doctor.specialization}\n`;
      response += `• Credentials: ${doctor.credentials}\n`;
      response += `• Available appointments: ${doctor.availableSlots} slots\n\n`;
    });

    return response;
  }

  /**
   * Handle requests for appointment preparation information
   */
  private async handlePreparationInfo(): Promise<string> {
    const preparationInfo = await this.tools.getFAQEntry("preparation");
    return `**Appointment Preparation:**\n${preparationInfo}\n\n`;
  }

  /**
   * Handle requests for policy information
   */
  private async handlePolicyInfo(): Promise<string> {
    const policyInfo = await this.tools.getFAQEntry("policy");
    return `**Cancellation Policy:**\n${policyInfo}\n\n`;
  }

  /**
   * Handle requests for location information
   */
  private async handleLocationInfo(): Promise<string> {
    const locationInfo = await this.tools.getFAQEntry("location");
    return `**Location & Parking:**\n${locationInfo}\n\n`;
  }

  /**
   * Handle general information requests
   */
  private async handleGeneralInfo(): Promise<string> {
    const faqs = await this.tools.getAllFAQEntries();

    let response = "**Frequently Asked Questions:**\n\n";
    faqs.forEach((faq) => {
      response += `• **${faq.question}** ${faq.answer}\n\n`;
    });

    return response;
  }

  /**
   * Check if the agent is currently active
   */
  public isAgentActive(): boolean {
    return this.isActive;
  }
}
