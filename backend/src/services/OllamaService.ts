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

      // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
      const url = this.baseUrl.replace('localhost', '127.0.0.1');
      
      const response = await fetch(`${url}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AgentCare-Backend/2.0.0"
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
      const timeout = parseInt(this.config.get("OLLAMA_TIMEOUT") || "30000");
      
      // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
      const url = this.baseUrl.replace('localhost', '127.0.0.1');
      
      const response = await fetch(`${url}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AgentCare-Backend/2.0.0"
        },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = (data as any)?.embedding || [];
      
      if (embedding.length === 0) {
        this.logger.warn("Empty embedding returned", {
          textLength: text.length,
          model: this.model,
        });
      }
      
      return embedding;
    } catch (error) {
      this.logger.error("Error generating embeddings", {
        error: error instanceof Error ? error.message : String(error),
        textLength: text.length,
        model: this.model,
      });
      return [];
    }
  }

  /**
   * Health check for Ollama service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
      const url = this.baseUrl.replace('localhost', '127.0.0.1');
      
      const response = await fetch(`${url}/api/tags`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AgentCare-Backend/2.0.0'
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      this.logger.debug("Ollama health check response", {
        status: response.status,
        statusText: response.statusText,
        url: `${url}/api/tags`
      });
      
      return response.ok;
    } catch (error) {
      this.logger.error("Ollama health check failed", {
        error: error instanceof Error ? error.message : String(error),
        baseUrl: this.baseUrl,
        resolvedUrl: this.baseUrl.replace('localhost', '127.0.0.1')
      });
      return false;
    }
  }

  /**
   * Health check with retry mechanism for service startup
   */
  async healthCheckWithRetry(
    maxRetries: number = parseInt(this.config.get("OLLAMA_STARTUP_MAX_RETRIES") || "5"),
    baseDelay: number = parseInt(this.config.get("OLLAMA_STARTUP_BASE_DELAY") || "2000"),
    maxDelay: number = parseInt(this.config.get("OLLAMA_STARTUP_MAX_DELAY") || "30000")
  ): Promise<boolean> {
    this.logger.info("Starting Ollama health check with retry", {
      maxRetries,
      baseDelay,
      maxDelay,
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`Ollama health check attempt ${attempt}/${maxRetries}`);
        
        const isHealthy = await this.healthCheck();
        
        if (isHealthy) {
          this.logger.info("Ollama service is healthy", {
            attempt,
            totalRetries: maxRetries,
          });
          return true;
        }

        if (attempt < maxRetries) {
          // Calculate exponential backoff delay with jitter
          const delay = Math.min(
            baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
            maxDelay
          );
          
          this.logger.warn(`Ollama not ready, retrying in ${Math.round(delay)}ms`, {
            attempt,
            nextRetryIn: Math.round(delay),
            remainingRetries: maxRetries - attempt,
          });

          await this.sleep(delay);
        }
      } catch (error) {
        this.logger.error(`Ollama health check attempt ${attempt} failed`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          remainingRetries: maxRetries - attempt,
        });

        if (attempt < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
          await this.sleep(delay);
        }
      }
    }

    this.logger.warn("Ollama service is not available after all retries", {
      maxRetries,
      totalWaitTime: Math.round(baseDelay * (Math.pow(2, maxRetries) - 1)),
    });
    
    return false;
  }

  /**
   * Check if a specific model is available
   */
  async checkModelAvailability(model?: string): Promise<boolean> {
    const modelToCheck = model || this.model;
    
    try {
      // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
      const url = this.baseUrl.replace('localhost', '127.0.0.1');
      
      const response = await fetch(`${url}/api/tags`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AgentCare-Backend/2.0.0'
        },
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const availableModels = (data as any)?.models || [];
      
      const isAvailable = availableModels.some((m: any) => 
        m.name === modelToCheck || m.name.startsWith(modelToCheck.split(':')[0])
      );

      if (!isAvailable) {
        this.logger.warn("Required model not available", {
          requestedModel: modelToCheck,
          availableModels: availableModels.map((m: any) => m.name),
        });
      }

      return isAvailable;
    } catch (error) {
      this.logger.error("Error checking model availability", {
        error: error instanceof Error ? error.message : String(error),
        model: modelToCheck,
      });
      return false;
    }
  }

  /**
   * Initialize Ollama service with comprehensive checks
   */
  async initialize(): Promise<{
    isHealthy: boolean;
    modelAvailable: boolean;
    message: string;
  }> {
    this.logger.info("Initializing Ollama service", {
      baseUrl: this.baseUrl,
      model: this.model,
    });

    // Check if Ollama service is healthy with retries
    const isHealthy = await this.healthCheckWithRetry();
    
    if (!isHealthy) {
      return {
        isHealthy: false,
        modelAvailable: false,
        message: "Ollama service is not available. Some AI features will be limited.",
      };
    }

    // Check if the required model is available
    const modelAvailable = await this.checkModelAvailability();
    
    if (!modelAvailable) {
      const autoPull = this.config.get("OLLAMA_AUTO_PULL_MODEL") === "true";
      
      if (autoPull) {
        this.logger.info("Attempting to pull required model", { model: this.model });
        
        try {
          const pullSuccess = await this.pullModel();
          if (pullSuccess) {
            return {
              isHealthy: true,
              modelAvailable: true,
              message: `Ollama service initialized successfully with model ${this.model}`,
            };
          } else {
            return {
              isHealthy: true,
              modelAvailable: false,
              message: `Ollama service is healthy but model ${this.model} could not be pulled`,
            };
          }
        } catch (error) {
          this.logger.error("Failed to pull model", {
            error: error instanceof Error ? error.message : String(error),
            model: this.model,
          });
          
          return {
            isHealthy: true,
            modelAvailable: false,
            message: `Ollama service is healthy but model ${this.model} is not available`,
          };
        }
      } else {
        this.logger.warn("Model not available and auto-pull is disabled", {
          model: this.model,
          autoPull,
        });
        
        return {
          isHealthy: true,
          modelAvailable: false,
          message: `Ollama service is healthy but model ${this.model} is not available (auto-pull disabled)`,
        };
      }
    }

    return {
      isHealthy: true,
      modelAvailable: true,
      message: `Ollama service initialized successfully with model ${this.model}`,
    };
  }

  /**
   * Helper method to sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Pull model if not available
   */
  async pullModel(model?: string): Promise<boolean> {
    const modelToPull = model || this.model;

    try {
      this.logger.info("Pulling Ollama model", { model: modelToPull });

      // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
      const url = this.baseUrl.replace('localhost', '127.0.0.1');
      
      const response = await fetch(`${url}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AgentCare-Backend/2.0.0"
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
