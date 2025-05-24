import { Logger } from "../utils/Logger";
import { Config } from "../utils/Config";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    reminders: boolean;
  };
  preferredDoctorSpecializations: string[];
}

export interface UserProfile {
  dateOfBirth?: Date;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
}

export interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  messages: ConversationMessage[];
  summary: string;
  entities: Map<string, any>;
  lastUpdated: Date;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    agentType?: string;
    tokens?: number;
  };
}

/**
 * User Management Service for handling authentication and user data
 */
export class UserManagementService {
  private logger: Logger;
  private config: Config;
  private users: Map<string, User> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private conversations: Map<string, ConversationContext> = new Map();
  private jwtSecret: string;

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    this.config = config;
    this.jwtSecret =
      config.get("JWT_SECRET") ||
      "agentcare-default-secret-change-in-production";

    // Initialize with demo users
    this.initializeDemoUsers();
  }

  /**
   * Register a new user
   */
  async registerUser(
    email: string,
    password: string,
    name: string,
    phone?: string,
  ): Promise<{ user: User; token: string }> {
    try {
      // Check if user already exists
      const existingUser = Array.from(this.users.values()).find(
        (u) => u.email === email,
      );
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Create new user
      const userId = this.generateId();
      const passwordHash = this.hashPassword(password);

      const user: User = {
        id: userId,
        email,
        name,
        phone,
        passwordHash,
        createdAt: new Date(),
        isActive: true,
        preferences: this.getDefaultPreferences(),
        profile: {},
      };

      this.users.set(userId, user);

      // Create session and JWT token
      const session = await this.createSession(userId);
      const token = this.generateJWT(userId, session.sessionId);

      this.logger.info("User registered successfully", { userId, email });

      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      this.logger.error("Error registering user", {
        error: error instanceof Error ? error.message : String(error),
        email,
      });
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    try {
      const user = Array.from(this.users.values()).find(
        (u) => u.email === email,
      );

      if (!user || !user.isActive) {
        throw new Error("Invalid credentials or account inactive");
      }

      if (!this.verifyPassword(password, user.passwordHash)) {
        throw new Error("Invalid credentials");
      }

      // Update last login
      user.lastLoginAt = new Date();
      this.users.set(user.id, user);

      // Create new session
      const session = await this.createSession(user.id);
      const token = this.generateJWT(user.id, session.sessionId);

      this.logger.info("User authenticated successfully", {
        userId: user.id,
        email,
      });

      return {
        user: this.sanitizeUser(user),
        token,
      };
    } catch (error) {
      this.logger.error("Error authenticating user", {
        error: error instanceof Error ? error.message : String(error),
        email,
      });
      throw error;
    }
  }

  /**
   * Validate JWT token and get user session
   */
  async validateToken(
    token: string,
  ): Promise<{ user: User; session: UserSession }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const { userId, sessionId } = decoded;

      const user = this.users.get(userId);
      const session = this.sessions.get(sessionId);

      if (
        !user ||
        !session ||
        !session.isActive ||
        session.expiresAt < new Date()
      ) {
        throw new Error("Invalid or expired token");
      }

      // Update session activity
      session.lastActivityAt = new Date();
      this.sessions.set(sessionId, session);

      return { user: this.sanitizeUser(user), session };
    } catch (error) {
      this.logger.error("Error validating token", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error("Invalid token");
    }
  }

  /**
   * Get or create conversation context for user
   */
  async getConversationContext(
    userId: string,
    sessionId: string,
  ): Promise<ConversationContext> {
    const contextKey = `${userId}:${sessionId}`;

    if (!this.conversations.has(contextKey)) {
      const context: ConversationContext = {
        userId,
        sessionId,
        messages: [],
        summary: "",
        entities: new Map(),
        lastUpdated: new Date(),
      };
      this.conversations.set(contextKey, context);
    }

    return this.conversations.get(contextKey)!;
  }

  /**
   * Add message to conversation context
   */
  async addMessage(
    userId: string,
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: any,
  ): Promise<ConversationMessage> {
    const context = await this.getConversationContext(userId, sessionId);

    const message: ConversationMessage = {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date(),
      metadata,
    };

    context.messages.push(message);
    context.lastUpdated = new Date();

    // Keep only last 50 messages for performance
    if (context.messages.length > 50) {
      context.messages = context.messages.slice(-50);
    }

    this.conversations.set(`${userId}:${sessionId}`, context);

    this.logger.debug("Message added to conversation", {
      userId,
      sessionId,
      role,
      messageLength: content.length,
    });

    return message;
  }

  /**
   * Get conversation history for context
   */
  async getConversationHistory(
    userId: string,
    sessionId: string,
    limit: number = 10,
  ): Promise<string> {
    const context = await this.getConversationContext(userId, sessionId);

    const recentMessages = context.messages.slice(-limit);

    return recentMessages
      .map((msg) => {
        const timestamp = msg.timestamp.toISOString();
        return `[${timestamp}] ${msg.role}: ${msg.content}`;
      })
      .join("\n");
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.preferences = { ...user.preferences, ...preferences };
    this.users.set(userId, user);

    this.logger.info("User preferences updated", { userId });
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    profile: Partial<UserProfile>,
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.profile = { ...user.profile, ...profile };
    this.users.set(userId, user);

    this.logger.info("User profile updated", { userId });
    return this.sanitizeUser(user);
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
      this.logger.info("User logged out", {
        sessionId,
        userId: session.userId,
      });
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info("Cleaned up expired sessions", { count: cleanedCount });
    }
  }

  // Private helper methods

  private async createSession(
    userId: string,
    expiresInHours: number = 24,
  ): Promise<UserSession> {
    const sessionId = this.generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const session: UserSession = {
      sessionId,
      userId,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  private generateJWT(userId: string, sessionId: string): string {
    return jwt.sign({ userId, sessionId }, this.jwtSecret, {
      expiresIn: "24h",
    });
  }

  private generateId(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(":");
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return hash === verifyHash;
  }

  private sanitizeUser(user: User): User {
    const { passwordHash, ...sanitized } = user;
    return sanitized as User;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      language: "en",
      timezone: "UTC",
      notifications: {
        email: true,
        sms: false,
        reminders: true,
      },
      preferredDoctorSpecializations: [],
    };
  }

  private initializeDemoUsers(): void {
    // Create demo users for testing
    const demoUsers = [
      {
        email: "patient@example.com",
        password: "demo123",
        name: "John Doe",
        phone: "+1-555-0123",
      },
      {
        email: "admin@agentcare.com",
        password: "admin123",
        name: "Dr. Admin",
        phone: "+1-555-0100",
      },
    ];

    demoUsers.forEach((userData) => {
      const userId = this.generateId();
      const passwordHash = this.hashPassword(userData.password);

      const user: User = {
        id: userId,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        passwordHash,
        createdAt: new Date(),
        isActive: true,
        preferences: this.getDefaultPreferences(),
        profile: {},
      };

      this.users.set(userId, user);
    });

    this.logger.info("Demo users initialized", { count: demoUsers.length });
  }
}
