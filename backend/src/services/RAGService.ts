import { Logger } from '../utils/Logger';
import { OllamaService } from './OllamaService';
import { UserManagementService, ConversationMessage } from './UserManagementService';

export interface VectorDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata: {
        userId: string;
        sessionId: string;
        messageId?: string;
        timestamp: Date;
        type: 'conversation' | 'knowledge' | 'appointment' | 'doctor_info';
        source: string;
        importance: number; // 0-1 scale
    };
}

export interface SearchResult {
    document: VectorDocument;
    score: number;
    relevance: number;
}

export interface ContextSummary {
    recentContext: string;
    relevantHistory: string;
    userPreferences: string;
    entities: Map<string, any>;
    conversationSummary: string;
}

/**
 * RAG Service for managing conversation memory and context retrieval
 */
export class RAGService {
    private logger: Logger;
    private ollamaService: OllamaService;
    private userService: UserManagementService;
    private vectorStore: Map<string, VectorDocument> = new Map();
    private userKnowledgeBase: Map<string, VectorDocument[]> = new Map();

    constructor(
        logger: Logger, 
        ollamaService: OllamaService,
        userService: UserManagementService
    ) {
        this.logger = logger;
        this.ollamaService = ollamaService;
        this.userService = userService;
        
        // Initialize with healthcare knowledge base
        this.initializeKnowledgeBase();
    }

    /**
     * Store conversation message in vector database
     */
    async storeConversationMessage(
        userId: string,
        sessionId: string,
        message: ConversationMessage
    ): Promise<void> {
        try {
            // Generate embedding for the message
            const embedding = await this.ollamaService.generateEmbeddings(message.content);
            
            const document: VectorDocument = {
                id: `conv_${message.id}`,
                content: message.content,
                embedding,
                metadata: {
                    userId,
                    sessionId,
                    messageId: message.id,
                    timestamp: message.timestamp,
                    type: 'conversation',
                    source: `${message.role}_message`,
                    importance: this.calculateMessageImportance(message)
                }
            };

            this.vectorStore.set(document.id, document);

            // Add to user's knowledge base
            if (!this.userKnowledgeBase.has(userId)) {
                this.userKnowledgeBase.set(userId, []);
            }
            this.userKnowledgeBase.get(userId)!.push(document);

            this.logger.debug('Conversation message stored in vector DB', { 
                userId, 
                messageId: message.id,
                embeddingSize: embedding.length 
            });

        } catch (error) {
            this.logger.error('Error storing conversation message', {
                error: error instanceof Error ? error.message : String(error),
                userId,
                sessionId
            });
            throw error;
        }
    }

    /**
     * Store appointment or doctor information
     */
    async storeStructuredData(
        userId: string,
        content: string,
        type: 'appointment' | 'doctor_info',
        metadata: any = {}
    ): Promise<void> {
        try {
            const embedding = await this.ollamaService.generateEmbeddings(content);
            
            const document: VectorDocument = {
                id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content,
                embedding,
                metadata: {
                    userId,
                    sessionId: 'system',
                    timestamp: new Date(),
                    type,
                    source: 'structured_data',
                    importance: 0.9,
                    ...metadata
                }
            };

            this.vectorStore.set(document.id, document);

            if (!this.userKnowledgeBase.has(userId)) {
                this.userKnowledgeBase.set(userId, []);
            }
            this.userKnowledgeBase.get(userId)!.push(document);

            this.logger.info('Structured data stored in vector DB', { 
                userId, 
                type, 
                contentLength: content.length 
            });

        } catch (error) {
            this.logger.error('Error storing structured data', { 
                error: error instanceof Error ? error.message : String(error), 
                userId, 
                type 
            });
        }
    }

    /**
     * Retrieve relevant context for a user query
     */
    async retrieveContext(
        userId: string,
        sessionId: string,
        query: string,
        maxResults: number = 5
    ): Promise<ContextSummary> {
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.ollamaService.generateEmbeddings(query);
            
            // Get user's knowledge base
            const userDocs = this.userKnowledgeBase.get(userId) || [];
            
            // Calculate similarity scores
            const searchResults: SearchResult[] = [];
            
            for (const doc of userDocs) {
                const similarity = this.calculateCosineSimilarity(queryEmbedding, doc.embedding);
                const relevance = similarity * doc.metadata.importance;
                
                if (similarity > 0.3) { // Threshold for relevance
                    searchResults.push({
                        document: doc,
                        score: similarity,
                        relevance
                    });
                }
            }

            // Sort by relevance and take top results
            searchResults.sort((a, b) => b.relevance - a.relevance);
            const topResults = searchResults.slice(0, maxResults);

            // Get recent conversation context
            const recentContext = await this.userService.getConversationHistory(userId, sessionId, 5);

            // Build context summary
            const contextSummary: ContextSummary = {
                recentContext,
                relevantHistory: this.buildRelevantHistory(topResults),
                userPreferences: await this.getUserPreferencesContext(userId),
                entities: await this.extractEntitiesFromResults(topResults),
                conversationSummary: await this.generateConversationSummary(userId, sessionId)
            };

            this.logger.info('Context retrieved', { 
                userId, 
                queryLength: query.length,
                resultsCount: topResults.length,
                avgRelevance: topResults.reduce((sum, r) => sum + r.relevance, 0) / topResults.length
            });

            return contextSummary;

        } catch (error) {
            this.logger.error('Error retrieving context', { 
                error: error instanceof Error ? error.message : String(error), 
                userId 
            });
            
            // Return empty context on error
            return {
                recentContext: '',
                relevantHistory: '',
                userPreferences: '',
                entities: new Map(),
                conversationSummary: ''
            };
        }
    }

    /**
     * Generate enhanced prompt with RAG context
     */
    async generateEnhancedPrompt(
        userId: string,
        sessionId: string,
        userMessage: string,
        agentType: string
    ): Promise<string> {
        try {
            const context = await this.retrieveContext(userId, sessionId, userMessage);
            
            const systemPrompt = `You are a specialized AI agent in the AgentCare healthcare scheduling system.
            Agent Type: ${agentType}
            
            USER CONTEXT:
            ${context.userPreferences}
            
            RECENT CONVERSATION:
            ${context.recentContext}
            
            RELEVANT HISTORY:
            ${context.relevantHistory}
            
            CONVERSATION SUMMARY:
            ${context.conversationSummary}
            
            CURRENT USER MESSAGE: ${userMessage}
            
            Please respond as the ${agentType} agent, using the provided context to give personalized and relevant assistance.
            If the user is asking about previous conversations or appointments, reference the relevant history.
            Maintain conversation continuity and remember user preferences.`;

            return systemPrompt;

        } catch (error) {
            this.logger.error('Error generating enhanced prompt', {
                error: error instanceof Error ? error.message : String(error),
                userId,
                sessionId
            });
            throw error;
        }
    }

    /**
     * Update conversation summary
     */
    async updateConversationSummary(userId: string, sessionId: string): Promise<void> {
        try {
            const context = await this.userService.getConversationContext(userId, sessionId);
            
            if (context.messages.length < 5) {
                return; // Not enough messages to summarize
            }

            const recentMessages = context.messages.slice(-10).map(m => 
                `${m.role}: ${m.content}`
            ).join('\n');

            const summaryPrompt = `Summarize the following healthcare conversation in 2-3 sentences, 
            focusing on key intents, appointments discussed, and user preferences:
            
            ${recentMessages}`;

            const result = await this.ollamaService.generateResponse(summaryPrompt);
            context.summary = result.response;

            this.logger.debug('Conversation summary updated', { userId, sessionId });

        } catch (error) {
            this.logger.error('Error updating conversation summary', { 
                error: error instanceof Error ? error.message : String(error), 
                userId 
            });
        }
    }

    /**
     * Clean up old vector documents for a user
     */
    async cleanupUserData(userId: string, olderThanDays: number = 30): Promise<void> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const userDocs = this.userKnowledgeBase.get(userId) || [];
            const activeData = userDocs.filter(doc => doc.metadata.timestamp > cutoffDate);
            
            // Remove old documents from vector store
            userDocs.forEach(doc => {
                if (doc.metadata.timestamp <= cutoffDate) {
                    this.vectorStore.delete(doc.id);
                }
            });

            this.userKnowledgeBase.set(userId, activeData);

            this.logger.info('User data cleaned up', { 
                userId, 
                removedCount: userDocs.length - activeData.length,
                retainedCount: activeData.length 
            });

        } catch (error) {
            this.logger.error('Error cleaning up user data', { 
                error: error instanceof Error ? error.message : String(error), 
                userId 
            });
        }
    }

    // Private helper methods

    private calculateMessageImportance(message: ConversationMessage): number {
        let importance = 0.5; // Base importance
        
        // Increase importance for user messages
        if (message.role === 'user') {
            importance += 0.2;
        }

        // Increase importance for messages with specific intents
        if (message.metadata?.intent) {
            switch (message.metadata.intent) {
                case 'booking':
                case 'modification':
                    importance += 0.3;
                    break;
                case 'availability':
                case 'information':
                    importance += 0.2;
                    break;
            }
        }

        // Increase importance for longer messages (more context)
        if (message.content.length > 100) {
            importance += 0.1;
        }

        return Math.min(1, importance);
    }

    private calculateCosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private buildRelevantHistory(results: SearchResult[]): string {
        return results.map(result => {
            const doc = result.document;
            const timestamp = doc.metadata.timestamp.toLocaleDateString();
            return `[${timestamp}] ${doc.content}`;
        }).join('\n');
    }

    private async getUserPreferencesContext(userId: string): Promise<string> {
        try {
            const { user } = await this.userService.validateToken('dummy'); // We'd need actual token validation
            // For now, return empty - would implement proper user preference retrieval
            return '';
        } catch {
            return '';
        }
    }

    private async extractEntitiesFromResults(results: SearchResult[]): Promise<Map<string, any>> {
        const entities = new Map();
        
        results.forEach(result => {
            if (result.document.metadata.type === 'appointment') {
                // Extract appointment-related entities
                entities.set('lastAppointment', result.document.content);
            } else if (result.document.metadata.type === 'doctor_info') {
                // Extract doctor preferences
                entities.set('preferredDoctor', result.document.content);
            }
        });

        return entities;
    }

    private async generateConversationSummary(userId: string, sessionId: string): Promise<string> {
        const context = await this.userService.getConversationContext(userId, sessionId);
        return context.summary || '';
    }

    private async initializeKnowledgeBase(): Promise<void> {
        // Initialize with general healthcare knowledge
        const healthcareKnowledge = [
            {
                content: 'AgentCare offers appointment booking with specialists including cardiology, dermatology, and pediatrics.',
                type: 'knowledge' as const
            },
            {
                content: 'Appointments can be scheduled Monday through Friday, 9 AM to 5 PM.',
                type: 'knowledge' as const
            },
            {
                content: 'Patients can cancel or reschedule appointments up to 24 hours in advance.',
                type: 'knowledge' as const
            },
            {
                content: 'We accept most major insurance providers. Please bring your insurance card to your appointment.',
                type: 'knowledge' as const
            }
        ];

        for (const knowledge of healthcareKnowledge) {
            try {
                const embedding = await this.ollamaService.generateEmbeddings(knowledge.content);
                
                const document: VectorDocument = {
                    id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    content: knowledge.content,
                    embedding,
                    metadata: {
                        userId: 'system',
                        sessionId: 'system',
                        timestamp: new Date(),
                        type: knowledge.type,
                        source: 'knowledge_base',
                        importance: 0.8
                    }
                };

                this.vectorStore.set(document.id, document);
            } catch (error) {
                this.logger.error('Error initializing knowledge base item', { 
                    error: error instanceof Error ? error.message : String(error) 
                });
            }
        }

        this.logger.info('Healthcare knowledge base initialized', { itemCount: healthcareKnowledge.length });
    }
} 