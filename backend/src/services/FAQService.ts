import { Logger } from "../utils/Logger";

/**
 * Interface for FAQ entry
 */
export interface FAQEntry {
  id: number;
  category: string;
  question: string;
  answer: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing FAQ operations
 */
export class FAQService {
  private logger: Logger;
  private faqs: FAQEntry[] = [
    {
      id: 1,
      category: "preparation",
      question: "What should I bring to my appointment?",
      answer:
        "Please bring a valid ID, insurance card, list of current medications, and any relevant medical records.",
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      category: "policy",
      question: "What is the cancellation policy?",
      answer:
        "Appointments can be cancelled up to 24 hours in advance without penalty. Late cancellations may incur a fee.",
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      category: "location",
      question: "Where are you located?",
      answer:
        "We are located at 123 Healthcare Ave, Medical District. Free parking is available in the adjacent garage.",
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      category: "general",
      question: "How do I schedule an appointment?",
      answer:
        "You can schedule an appointment through our AI assistant, by calling our office, or using our online portal.",
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Find all FAQ entries
   */
  public async findAll(): Promise<FAQEntry[]> {
    this.logger.info("Fetching all FAQ entries");
    return [...this.faqs].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Find FAQ by category
   * @param category - The FAQ category
   */
  public async findByCategory(category: string): Promise<FAQEntry | null> {
    this.logger.info("Finding FAQ by category", { category });
    return this.faqs.find((faq) => faq.category === category) || null;
  }

  /**
   * Search FAQs by query
   * @param query - The search query
   */
  public async search(query: string): Promise<FAQEntry[]> {
    this.logger.info("Searching FAQs", { query });
    if (!query) return this.faqs;

    const lowerQuery = query.toLowerCase();
    return this.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery) ||
        faq.category.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Create a new FAQ entry
   * @param faqData - The FAQ data
   */
  public async create(faqData: Partial<FAQEntry>): Promise<FAQEntry> {
    this.logger.info("Creating new FAQ entry", { faqData });
    const newFAQ: FAQEntry = {
      id: Math.max(...this.faqs.map((f) => f.id)) + 1,
      category: faqData.category || "general",
      question: faqData.question || "",
      answer: faqData.answer || "",
      priority: faqData.priority || 999,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.faqs.push(newFAQ);
    return newFAQ;
  }

  /**
   * Update FAQ entry
   * @param id - The FAQ ID
   * @param updateData - The data to update
   */
  public async update(
    id: number,
    updateData: Partial<FAQEntry>,
  ): Promise<FAQEntry | null> {
    this.logger.info("Updating FAQ entry", { id, updateData });
    const faqIndex = this.faqs.findIndex((faq) => faq.id === id);

    if (faqIndex === -1) return null;

    this.faqs[faqIndex] = {
      ...this.faqs[faqIndex],
      ...updateData,
      updatedAt: new Date(),
    };

    return this.faqs[faqIndex];
  }

  /**
   * Delete FAQ entry
   * @param id - The FAQ ID
   */
  public async delete(id: number): Promise<boolean> {
    this.logger.info("Deleting FAQ entry", { id });
    const faqIndex = this.faqs.findIndex((faq) => faq.id === id);

    if (faqIndex === -1) return false;

    this.faqs.splice(faqIndex, 1);
    return true;
  }
}
