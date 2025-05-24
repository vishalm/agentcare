import { Logger } from "../utils/Logger";
import { DoctorService } from "../services/DoctorService";
import { FAQService } from "../services/FAQService";

/**
 * Specialized tools for handling FAQ operations
 * Provides methods for retrieving and managing FAQ information
 */
export class FAQTools {
  private activeTools: Set<string> = new Set();
  private readonly logger: Logger;
  private readonly doctorService: DoctorService;
  private readonly faqService: FAQService;

  constructor(
    logger: Logger,
    doctorService: DoctorService,
    faqService: FAQService,
  ) {
    this.logger = logger;
    this.doctorService = doctorService;
    this.faqService = faqService;
  }

  /**
   * Activate specific tools for the current operation
   * @param tools - Array of tool names to activate
   */
  public async activate(tools: string[]): Promise<void> {
    this.activeTools = new Set(tools);
    this.logger.info("FAQTools activated", { tools });
  }

  /**
   * Parse information request to determine type
   * @param message - The user's information request
   */
  public async parseInformationRequest(message: string): Promise<string> {
    this.validateToolActive("faqDatabase");
    const lower = message.toLowerCase();

    if (
      lower.includes("doctor") ||
      lower.includes("credential") ||
      lower.includes("about")
    ) {
      return "doctor";
    }
    if (lower.includes("prepare") || lower.includes("what to bring")) {
      return "preparation";
    }
    if (lower.includes("cancel") || lower.includes("policy")) {
      return "policy";
    }
    if (lower.includes("location") || lower.includes("where")) {
      return "location";
    }

    return "general";
  }

  /**
   * Get doctor information based on query
   * @param query - The search query
   */
  public async getDoctorInformation(query: string): Promise<any[]> {
    this.validateToolActive("doctorCredentials");
    return this.doctorService.search(query);
  }

  /**
   * Get FAQ entry by category
   * @param category - The FAQ category
   */
  public async getFAQEntry(category: string): Promise<string> {
    this.validateToolActive("faqDatabase");
    const entry = await this.faqService.findByCategory(category);
    return entry?.answer || "Information not available.";
  }

  /**
   * Get all FAQ entries
   */
  public async getAllFAQEntries(): Promise<any[]> {
    this.validateToolActive("faqDatabase");
    return this.faqService.findAll();
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
