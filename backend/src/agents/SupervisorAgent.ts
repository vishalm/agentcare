import { IAgent } from "./interfaces/IAgent";
import { Logger } from "../utils/Logger";
import { MetricsCollector } from "../utils/MetricsCollector";
import { OllamaService } from "../services/OllamaService";
import {
  UserManagementService,
  User,
  UserSession,
} from "../services/UserManagementService";
import { RAGService } from "../services/RAGService";
import { AvailabilityAgent } from "./AvailabilityAgent";
import { BookingAgent } from "./BookingAgent";
import { FAQAgent } from "./FAQAgent";

export interface ProcessingContext {
  user: User;
  session: UserSession;
  conversationHistory: string;
  ragContext: any;
}

/**
 * Enhanced SupervisorAgent with Ollama LLM, UMS, and RAG capabilities
 */
export class SupervisorAgent implements IAgent {
  private logger: Logger;
  private metrics: MetricsCollector;
  private ollamaService: OllamaService;
  private userService: UserManagementService;
  private ragService: RAGService;
  private availabilityAgent: AvailabilityAgent;
  private bookingAgent: BookingAgent;
  private faqAgent: FAQAgent;
  private isActive: boolean = false;

  constructor(
    logger: Logger,
    metrics: MetricsCollector,
    ollamaService: OllamaService,
    userService: UserManagementService,
    ragService: RAGService,
    availabilityAgent: AvailabilityAgent,
    bookingAgent: BookingAgent,
    faqAgent: FAQAgent,
  ) {
    this.logger = logger;
    this.metrics = metrics;
    this.ollamaService = ollamaService;
    this.userService = userService;
    this.ragService = ragService;
    this.availabilityAgent = availabilityAgent;
    this.bookingAgent = bookingAgent;
    this.faqAgent = faqAgent;
  }

  /**
   * Process user message with authentication and RAG context
   */
  async process(
    message: string,
    context?: { token?: string },
  ): Promise<string> {
    const operationId = `supervisor_process_${Date.now()}`;
    this.metrics.startOperation(operationId);
    this.isActive = true;

    try {
      this.logger.info("SupervisorAgent processing message", {
        messageLength: message.length,
        hasToken: !!context?.token,
      });

      // Authenticate user or create guest session
      let processingContext: ProcessingContext;

      if (context?.token) {
        try {
          const { user, session } = await this.userService.validateToken(
            context.token,
          );
          processingContext = {
            user,
            session,
            conversationHistory: await this.userService.getConversationHistory(
              user.id,
              session.sessionId,
            ),
            ragContext: await this.ragService.retrieveContext(
              user.id,
              session.sessionId,
              message,
            ),
          };

          this.logger.info("Authenticated user session", {
            userId: user.id,
            sessionId: session.sessionId,
          });
        } catch (error) {
          this.logger.warn("Token validation failed, creating guest session", {
            error: error instanceof Error ? error.message : String(error),
          });
          processingContext = await this.createGuestSession();
        }
      } else {
        processingContext = await this.createGuestSession();
      }

      // Store user message in conversation history
      await this.userService.addMessage(
        processingContext.user.id,
        processingContext.session.sessionId,
        "user",
        message,
      );

      // Store message in RAG system
      const userMessage = await this.userService.addMessage(
        processingContext.user.id,
        processingContext.session.sessionId,
        "user",
        message,
      );
      await this.ragService.storeConversationMessage(
        processingContext.user.id,
        processingContext.session.sessionId,
        userMessage,
      );

      // Analyze intent using Ollama
      const intentAnalysis = await this.ollamaService.analyzeIntent(
        message,
        processingContext.conversationHistory,
      );

      this.logger.info("Intent analysis completed", {
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        userId: processingContext.user.id,
      });

      // Route to appropriate agent based on intent
      let response: string;
      let agentType: string;

      switch (intentAnalysis.intent) {
        case "booking":
        case "modification":
          agentType = "booking";
          response = await this.delegateToBookingAgent(
            message,
            processingContext,
            intentAnalysis,
          );
          break;
        case "availability":
          agentType = "availability";
          response = await this.delegateToAvailabilityAgent(
            message,
            processingContext,
            intentAnalysis,
          );
          break;
        case "information":
          agentType = "information";
          response = await this.delegateToFAQAgent(
            message,
            processingContext,
            intentAnalysis,
          );
          break;
        default:
          agentType = "general";
          response = await this.handleGeneralConversation(
            message,
            processingContext,
            intentAnalysis,
          );
      }

      // Store assistant response
      const assistantMessage = await this.userService.addMessage(
        processingContext.user.id,
        processingContext.session.sessionId,
        "assistant",
        response,
        {
          intent: intentAnalysis.intent,
          confidence: intentAnalysis.confidence,
          agentType,
          tokens: 0, // Would be populated by Ollama response
        },
      );

      // Store response in RAG system
      await this.ragService.storeConversationMessage(
        processingContext.user.id,
        processingContext.session.sessionId,
        assistantMessage,
      );

      // Update conversation summary periodically
      if (processingContext.ragContext?.recentContext?.length > 500) {
        await this.ragService.updateConversationSummary(
          processingContext.user.id,
          processingContext.session.sessionId,
        );
      }

      this.metrics.endOperation(operationId);
      this.metrics.incrementCounter("supervisor_successful_responses");

      this.logger.info("SupervisorAgent completed processing", {
        intent: intentAnalysis.intent,
        agentType,
        responseLength: response.length,
        userId: processingContext.user.id,
      });

      return response;
    } catch (error) {
      this.metrics.endOperation(operationId);
      this.metrics.recordError("supervisor_process");
      this.logger.error("Error in SupervisorAgent processing", {
        error: error instanceof Error ? error.message : String(error),
      });

      return "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment. If the problem persists, you can contact our support team.";
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Delegate to BookingAgent with enhanced context
   */
  private async delegateToBookingAgent(
    message: string,
    context: ProcessingContext,
    intentAnalysis: any,
  ): Promise<string> {
    try {
      this.logger.info("Delegating to BookingAgent", {
        userId: context.user.id,
      });

      // Generate enhanced prompt with RAG context
      const enhancedPrompt = await this.ragService.generateEnhancedPrompt(
        context.user.id,
        context.session.sessionId,
        message,
        "BookingAgent",
      );

      // Get LLM response using enhanced context
      const ollamaResponse = await this.ollamaService.generateResponse(
        message,
        context.conversationHistory,
        enhancedPrompt,
      );

      // Check if we need to call booking tools
      const needsBookingAction = this.requiresBookingAction(
        ollamaResponse.response,
      );

      if (needsBookingAction) {
        // Call the traditional booking agent for actual booking operations
        const bookingResult = await this.bookingAgent.process(
          message,
          intentAnalysis,
        );

        // Combine LLM response with booking result
        return `${ollamaResponse.response}\n\n${bookingResult}`;
      }

      this.metrics.incrementCounter("booking_agent_delegations");
      return ollamaResponse.response;
    } catch (error) {
      this.logger.error("Error delegating to BookingAgent", {
        error: error instanceof Error ? error.message : String(error),
      });
      return "I'm having trouble processing your booking request. Let me try a different approach.";
    }
  }

  /**
   * Delegate to AvailabilityAgent with enhanced context
   */
  private async delegateToAvailabilityAgent(
    message: string,
    context: ProcessingContext,
    intentAnalysis: any,
  ): Promise<string> {
    try {
      this.logger.info("Delegating to AvailabilityAgent", {
        userId: context.user.id,
      });

      // Generate enhanced prompt with RAG context
      const enhancedPrompt = await this.ragService.generateEnhancedPrompt(
        context.user.id,
        context.session.sessionId,
        message,
        "AvailabilityAgent",
      );

      // Get actual availability data from the traditional agent
      const availabilityData = await this.availabilityAgent.process(
        message,
        intentAnalysis,
      );

      // Use LLM to present the availability data in a conversational way
      const presentationPrompt = `Present the following availability information in a helpful, conversational manner:
            
            ${availabilityData}
            
            User's message: ${message}
            
            Make the response personal and easy to understand.`;

      const ollamaResponse = await this.ollamaService.generateResponse(
        presentationPrompt,
        context.conversationHistory,
        enhancedPrompt,
      );

      this.metrics.incrementCounter("availability_agent_delegations");
      return ollamaResponse.response;
    } catch (error) {
      this.logger.error("Error delegating to AvailabilityAgent", {
        error: error instanceof Error ? error.message : String(error),
      });
      return "I'm having trouble checking availability. Let me try to help you another way.";
    }
  }

  /**
   * Delegate to FAQAgent with enhanced context
   */
  private async delegateToFAQAgent(
    message: string,
    context: ProcessingContext,
    intentAnalysis: any,
  ): Promise<string> {
    try {
      this.logger.info("Delegating to FAQAgent", { userId: context.user.id });

      // Generate enhanced prompt with RAG context and FAQ data
      const faqData = await this.faqAgent.process(message, intentAnalysis);

      const enhancedPrompt = await this.ragService.generateEnhancedPrompt(
        context.user.id,
        context.session.sessionId,
        message,
        "FAQAgent",
      );

      const presentationPrompt = `Answer the user's question using the following information:
            
            ${faqData}
            
            User's question: ${message}
            
            Provide a helpful, personalized response based on their conversation history and the available information.`;

      const ollamaResponse = await this.ollamaService.generateResponse(
        presentationPrompt,
        context.conversationHistory,
        enhancedPrompt,
      );

      this.metrics.incrementCounter("faq_agent_delegations");
      return ollamaResponse.response;
    } catch (error) {
      this.logger.error("Error delegating to FAQAgent", {
        error: error instanceof Error ? error.message : String(error),
      });
      return "I'd be happy to help with your question. Could you please rephrase it, and I'll do my best to assist you?";
    }
  }

  /**
   * Handle general conversation using Ollama
   */
  private async handleGeneralConversation(
    message: string,
    context: ProcessingContext,
    _intentAnalysis: any, // Prefixed with _ to indicate intentionally unused
  ): Promise<string> {
    try {
      this.logger.info("Handling general conversation", {
        userId: context.user.id,
      });

      const systemPrompt = `You are a helpful healthcare assistant for AgentCare. 
            Maintain a friendly, professional tone and try to guide conversations toward helpful healthcare services.
            
            Available services:
            - Appointment booking with specialists
            - Checking doctor availability  
            - Information about doctors and services
            
            User's name: ${context.user.name || "Guest"}
            
            If the user seems to want healthcare assistance, gently guide them to the appropriate service.`;

      const ollamaResponse = await this.ollamaService.generateResponse(
        message,
        context.conversationHistory,
        systemPrompt,
      );

      this.metrics.incrementCounter("general_conversations");
      return ollamaResponse.response;
    } catch (error) {
      this.logger.error("Error handling general conversation", {
        error: error instanceof Error ? error.message : String(error),
      });
      return "I'm here to help with your healthcare needs. You can ask me about booking appointments, checking doctor availability, or general information about our services.";
    }
  }

  /**
   * Create guest session for unauthenticated users
   */
  private async createGuestSession(): Promise<ProcessingContext> {
    // Create a temporary guest user
    const guestUser = {
      id: `guest_${Date.now()}`,
      email: "guest@agentcare.com",
      name: "Guest User",
      passwordHash: "",
      createdAt: new Date(),
      isActive: true,
      preferences: {
        language: "en",
        timezone: "UTC",
        notifications: { email: false, sms: false, reminders: false },
        preferredDoctorSpecializations: [],
      },
      profile: {},
    };

    const guestSession = {
      sessionId: `session_${Date.now()}`,
      userId: guestUser.id,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      isActive: true,
    };

    return {
      user: guestUser,
      session: guestSession,
      conversationHistory: "",
      ragContext: null,
    };
  }

  /**
   * Check if LLM response indicates need for booking action
   */
  private requiresBookingAction(response: string): boolean {
    const actionKeywords = [
      "book the appointment",
      "schedule for you",
      "confirm the booking",
      "reserve the slot",
      "complete the appointment",
    ];

    return actionKeywords.some((keyword) =>
      response.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  /**
   * Get agent status
   */
  public isAgentActive(): boolean {
    return this.isActive;
  }

  /**
   * Reset conversation for a user
   */
  async resetConversation(userId: string, sessionId: string): Promise<void> {
    try {
      // Clear conversation context
      await this.userService.getConversationContext(userId, sessionId);

      // Clean up RAG data older than today
      await this.ragService.cleanupUserData(userId, 0);

      this.logger.info("Conversation reset completed", { userId, sessionId });
    } catch (error) {
      this.logger.error("Error resetting conversation", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
    }
  }

  /**
   * Health check for all integrated services
   */
  async healthCheck(): Promise<{ status: string; services: any }> {
    const services = {
      ollama: await this.ollamaService.healthCheck(),
      supervisor: true,
      availability: this.availabilityAgent ? true : false,
      booking: this.bookingAgent ? true : false,
      faq: this.faqAgent ? true : false,
    };

    const allHealthy = Object.values(services).every(
      (status) => status === true,
    );

    return {
      status: allHealthy ? "healthy" : "degraded",
      services,
    };
  }
}
