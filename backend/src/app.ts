import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Core utilities
import { Logger } from './utils/Logger';
import { MetricsCollector } from './utils/MetricsCollector';
import { ErrorHandler } from './utils/ErrorHandler';
import { Config } from './utils/Config';

// Services
import { DoctorService } from './services/DoctorService';
import { AppointmentService } from './services/AppointmentService';
import { FAQService } from './services/FAQService';
import { NotificationService } from './services/NotificationService';
import { EmailService } from './services/EmailService';
import { ValidationService } from './services/ValidationService';
import { OllamaService } from './services/OllamaService';
import { UserManagementService } from './services/UserManagementService';
import { RAGService } from './services/RAGService';

// Agents
import { SupervisorAgent } from './agents/SupervisorAgent';
import { AvailabilityAgent } from './agents/AvailabilityAgent';
import { BookingAgent } from './agents/BookingAgent';
import { FAQAgent } from './agents/FAQAgent';

// Tools
import { AvailabilityTools } from './tools/AvailabilityTools';
import { BookingTools } from './tools/BookingTools';
import { FAQTools } from './tools/FAQTools';

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import agentRoutes from './routes/agentRoutes';
import adminRoutes from './routes/adminRoutes';
import systemRoutes from './routes/systemRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

/**
 * AgentCare Application Setup
 * Enhanced modular Express app with AI agents, Ollama LLM, and RAG capabilities
 */

// Initialize core utilities
const logger = new Logger();
const config = Config.getInstance();
const metrics = new MetricsCollector(logger);
const errorHandler = new ErrorHandler(logger, metrics);

// Initialize services
let ollamaService: OllamaService;
let userService: UserManagementService;
let ragService: RAGService;
let doctorService: DoctorService;
let appointmentService: AppointmentService;
let faqService: FAQService;
let notificationService: NotificationService;
let emailService: EmailService;
let validationService: ValidationService;

// Initialize agents
let supervisorAgent: SupervisorAgent;
let availabilityAgent: AvailabilityAgent;
let bookingAgent: BookingAgent;
let faqAgent: FAQAgent;

/**
 * Initialize all services
 */
function initializeServices(): void {
  try {
    logger.info('Initializing AgentCare services...');

    // Initialize LLM and core services first
    ollamaService = new OllamaService(logger, config);
    userService = new UserManagementService(logger, config);
    ragService = new RAGService(logger, ollamaService, userService);

    // Initialize traditional services
    doctorService = new DoctorService(logger);
    appointmentService = new AppointmentService(logger);
    faqService = new FAQService(logger);
    emailService = new EmailService(logger);
    validationService = new ValidationService(logger);
    notificationService = new NotificationService(logger);

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Initialize all AI agents
 */
function initializeAgents(): void {
  try {
    logger.info('Initializing AI agents...');

    // Create tools first
    const availabilityTools = new AvailabilityTools(
      logger,
      doctorService,
      appointmentService,
    );

    const bookingTools = new BookingTools(
      logger,
      emailService,
      appointmentService,
      validationService,
      notificationService,
    );

    const faqTools = new FAQTools(
      logger,
      doctorService,
      faqService,
    );

    // Initialize agents with tools
    availabilityAgent = new AvailabilityAgent(
      logger,
      metrics,
      availabilityTools,
    );

    bookingAgent = new BookingAgent(
      logger,
      metrics,
      bookingTools,
    );

    faqAgent = new FAQAgent(logger, metrics, faqTools);

    // Initialize enhanced supervisor agent with all new capabilities
    supervisorAgent = new SupervisorAgent(
      logger,
      metrics,
      ollamaService,
      userService,
      ragService,
      availabilityAgent,
      bookingAgent,
      faqAgent,
    );

    logger.info('All agents initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize agents', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Initialize Ollama service with enhanced retry mechanisms
 */
async function initializeOllama(): Promise<void> {
  if (config.get('ENABLE_OLLAMA_LLM') === 'true') {
    logger.info('Initializing Ollama service...');
    
    const ollamaResult = await ollamaService.initialize();
    
    if (ollamaResult.isHealthy) {
      logger.info('Ollama service initialized successfully', {
        modelAvailable: ollamaResult.modelAvailable,
        message: ollamaResult.message,
      });
    } else {
      logger.warn('Ollama service initialization failed', {
        message: ollamaResult.message,
      });
    }
  }
}

// Initialize services and agents
initializeServices();
initializeAgents();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.get('CORS_ORIGIN') || process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(config.get('API_RATE_WINDOW') || '900000'),
  max: parseInt(config.get('API_RATE_LIMIT') || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Swagger API Documentation
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info hgroup.main h2 { color: #1f77b4 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 20px; border-radius: 5px; }
    .swagger-ui .info { margin: 30px 0; }
    .swagger-ui .info .title { font-size: 36px; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
  `,
  customSiteTitle: 'AgentCare API Documentation',
  customfavIcon: '/assets/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    operationsSorter: 'alpha',
    tagsSorter: 'alpha',
    filter: true,
    tryItOutEnabled: true
  }
};

// Swagger UI endpoint
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await supervisorAgent.healthCheck();
    res.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      environment: config.get('NODE_ENV') || 'development',
      services: health.services,
      features: {
        ollama: config.get('ENABLE_OLLAMA_LLM') === 'true',
        rag: config.get('ENABLE_RAG_SYSTEM') === 'true',
        userManagement: config.get('ENABLE_USER_REGISTRATION') === 'true',
        guestBooking: config.get('ENABLE_GUEST_BOOKING') === 'true',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Enhanced agent endpoints
app.post('/api/v1/agents/process', async (req, res) => {
  try {
    const { message } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
        timestamp: new Date().toISOString(),
      });
    }

    // Process with enhanced supervisor agent
    const response = await supervisorAgent.process(
      message,
      token ? { token } : undefined,
    );

    metrics.incrementCounter('api_agent_requests');

    res.json({
      response,
      timestamp: new Date().toISOString(),
      authenticated: !!token,
    });
  } catch (error) {
    errorHandler.handleError(
      error instanceof Error ? error : new Error(String(error)),
    );
    res.status(500).json({
      error: 'Failed to process request',
      timestamp: new Date().toISOString(),
    });
  }
});

// Agent status endpoint
app.get('/api/v1/agents/status', async (req, res) => {
  try {
    const health = await supervisorAgent.healthCheck();

    res.json({
      supervisor: {
        active: supervisorAgent.isAgentActive(),
        status: health.status,
      },
      services: health.services,
      metrics: metrics.exportMetrics(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get agent status',
      timestamp: new Date().toISOString(),
    });
  }
});

// Metrics endpoint
app.get('/api/v1/metrics', (req, res) => {
  try {
    res.json({
      metrics: metrics.exportMetrics(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to export metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

// Ollama service endpoint
app.get('/api/v1/ollama/status', async (req, res) => {
  try {
    const isHealthy = await ollamaService.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      model: config.get('OLLAMA_MODEL'),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Ollama status check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// User management endpoints
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
      });
    }

    const result = await userService.registerUser(email, password, name, phone);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Registration error', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Registration failed',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const result = await userService.authenticateUser(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Login error', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(401).json({
      error: 'Invalid credentials',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/v1/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const { session } = await userService.validateToken(token);
      await userService.logout(session.sessionId);
    }

    res.json({
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      message: 'Logout completed',
      timestamp: new Date().toISOString(),
    });
  }
});

// User profile endpoints
app.get('/api/v1/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user } = await userService.validateToken(token);

    res.json({
      user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(401).json({
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
});

// Conversation management
app.post('/api/v1/conversation/reset', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user, session } = await userService.validateToken(token);
    await supervisorAgent.resetConversation(user.id, session.sessionId);

    res.json({
      message: 'Conversation reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to reset conversation',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes (using modular routes)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

// Default route - redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// Serve static files
app.use(express.static('frontend/public'));

// Fallback for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: 'API endpoint not found',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.sendFile('index.html', { root: 'frontend/public' });
  }
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler.handleError(err instanceof Error ? err : new Error(String(err)));
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Export the app and initialization function
export { initializeOllama };
export default app; 