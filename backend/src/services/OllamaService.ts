import { Logger } from "../utils/Logger";
import { Config } from "../utils/Config";

/**
 * Service for interacting with Ollama LLM
 */
export class OllamaService {
  private logger: Logger;
  private config: Config;
  private baseUrl: string;
  private model: string;

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    this.config = config;
    this.baseUrl = config.get("OLLAMA_BASE_URL") || "http://localhost:11434";
    this.model = config.get("OLLAMA_MODEL") || "qwen2.5:latest";
  }

  /**
   * Generate a response using Ollama
   */
  async generateResponse(
    prompt: string,
    context?: string,
    systemPrompt?: string,
  ): Promise<{ response: string; tokens?: number }> {
    try {
      this.logger.info("Generating response with Ollama", {
        model: this.model,
        promptLength: prompt.length,
        hasContext: !!context,
      });

      const messages = [];

      // Add system prompt if provided
      if (systemPrompt) {
        messages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // Add context if provided
      if (context) {
        messages.push({
          role: "system",
          content: `Previous conversation context:\n${context}`,
        });
      }

      // Add user message
      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      this.logger.info("Ollama response generated", {
        responseLength: (data as any)?.message?.content?.length || 0,
        model: (data as any)?.model,
      });

      return {
        response:
          (data as any)?.message?.content ||
          "I apologize, but I could not generate a response.",
        tokens: (data as any)?.eval_count || 0,
      };
    } catch (error) {
      this.logger.error("Error generating Ollama response", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to generate response: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Analyze intent using Ollama
   */
  async analyzeIntent(
    message: string,
    context?: string,
  ): Promise<{
    intent: string;
    confidence: number;
    entities: any[];
    summary: string;
  }> {
    try {
      const systemPrompt = `You are an AI assistant for a healthcare scheduling system called AgentCare. 
            Analyze the user's message and determine their intent. 

            Available intents:
            - "booking": User wants to book, schedule, or make an appointment
            - "availability": User wants to check doctor availability, schedules, or available times
            - "information": User wants information about doctors, services, policies, or general questions
            - "modification": User wants to cancel, reschedule, or modify an existing appointment
            - "general": General conversation or unclear intent

            Respond with a JSON object containing:
            {
                "intent": "one of the above intents",
                "confidence": number between 0-1,
                "entities": ["extracted entities like doctor names, specializations, dates"],
                "summary": "brief summary of what the user wants"
            }

            Only respond with valid JSON, no additional text.`;

      const prompt = `User message: "${message}"`;

      const result = await this.generateResponse(prompt, context, systemPrompt);

      try {
        const analysis = JSON.parse(result.response);

        // Validate the response structure
        if (!analysis.intent || typeof analysis.confidence !== "number") {
          throw new Error("Invalid response structure");
        }

        this.logger.info("Intent analysis completed", {
          intent: analysis.intent,
          confidence: analysis.confidence,
        });

        return {
          intent: analysis.intent,
          confidence: Math.min(1, Math.max(0, analysis.confidence)),
          entities: analysis.entities || [],
          summary: analysis.summary || "User intent analysis",
        };
      } catch (parseError) {
        this.logger.warn(
          "Failed to parse intent analysis JSON, using fallback",
          {
            response: result.response,
          },
        );

        // Fallback intent analysis
        const lowerMessage = message.toLowerCase();
        if (
          lowerMessage.includes("book") ||
          lowerMessage.includes("schedule") ||
          lowerMessage.includes("appointment")
        ) {
          return {
            intent: "booking",
            confidence: 0.8,
            entities: [],
            summary: "Booking request",
          };
        } else if (
          lowerMessage.includes("available") ||
          lowerMessage.includes("when") ||
          lowerMessage.includes("time")
        ) {
          return {
            intent: "availability",
            confidence: 0.8,
            entities: [],
            summary: "Availability inquiry",
          };
        } else if (
          lowerMessage.includes("doctor") ||
          lowerMessage.includes("information") ||
          lowerMessage.includes("tell me")
        ) {
          return {
            intent: "information",
            confidence: 0.8,
            entities: [],
            summary: "Information request",
          };
        } else {
          return {
            intent: "general",
            confidence: 0.6,
            entities: [],
            summary: "General conversation",
          };
        }
      }
    } catch (error) {
      this.logger.error("Error analyzing intent with Ollama", {
        error: error instanceof Error ? error.message : String(error),
      });

      // Return default intent on error
      return {
        intent: "general",
        confidence: 0.5,
        entities: [],
        summary: "Could not analyze intent",
      };
    }
  }

  /**
   * Generate embeddings for text (for RAG system)
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return (data as any)?.embedding || [];
    } catch (error) {
      this.logger.error("Error generating embeddings", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Health check for Ollama service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      this.logger.error("Ollama health check failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Pull model if not available
   */
  async pullModel(model?: string): Promise<boolean> {
    const modelToPull = model || this.model;

    try {
      this.logger.info("Pulling Ollama model", { model: modelToPull });

      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelToPull,
        }),
      });

      return response.ok;
    } catch (error) {
      this.logger.error("Error pulling Ollama model", {
        error: error instanceof Error ? error.message : String(error),
        model: modelToPull,
      });
      throw error;
    }
  }
}
