import app, { initializeOllama } from './app';
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Graceful shutdown handler
async function gracefulShutdown(): Promise<void> {
  console.log('Graceful shutdown initiated...');
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Set a timeout to force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.log('Forcing shutdown...');
    process.exit(1);
  }, 10000);
}

// Graceful shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server with enhanced initialization
async function startServer(): Promise<void> {
  try {
    // Initialize Ollama service first
    await initializeOllama();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 AgentCare API server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 AI Agents: Supervisor, Availability, Booking, FAQ`);
      console.log(`🧠 RAG System: Vector-based conversation memory`);
      console.log(`🔒 Authentication: JWT-based user management`);
    });
  } catch (error) {
    console.error('Failed to start AgentCare server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default server; 