module.exports = {
  apps: [
    {
      // Main AgentCare API Server
      name: 'agentcare-api',
      script: './backend/dist/index.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        LOG_LEVEL: 'debug'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'warn'
      },
      // Performance & Monitoring
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      watch: false,
      // Logging
      log_file: './logs/pm2/agentcare-api.log',
      out_file: './logs/pm2/agentcare-api-out.log',
      error_file: './logs/pm2/agentcare-api-error.log',
      time: true,
      // Health monitoring
      health_check_path: '/health',
      health_check_grace_period: 3000,
      // Advanced settings
      listen_timeout: 3000,
      kill_timeout: 5000,
      wait_ready: true,
      // CPU and memory optimization
      node_args: '--max-old-space-size=2048 --optimize-for-size'
    },
    {
      // Agent Coordinator Service
      name: 'agentcare-coordinator',
      script: './backend/dist/services/AgentCoordinatorService.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        SERVICE_PORT: 3001,
        COORDINATOR_MODE: 'active'
      },
      env_production: {
        NODE_ENV: 'production',
        SERVICE_PORT: 3001,
        COORDINATOR_MODE: 'active'
      },
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 5,
      log_file: './logs/pm2/coordinator.log'
    },
    {
      // LLM Processing Service
      name: 'agentcare-llm-processor',
      script: './backend/dist/services/LLMProcessorService.js',
      instances: 1, // Single instance due to LLM resource constraints
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        SERVICE_PORT: 3002,
        OLLAMA_BASE_URL: 'http://localhost:11434'
      },
      env_production: {
        NODE_ENV: 'production',
        SERVICE_PORT: 3002,
        OLLAMA_BASE_URL: 'http://ollama:11434'
      },
      max_memory_restart: '2G',
      min_uptime: '30s',
      max_restarts: 3,
      log_file: './logs/pm2/llm-processor.log'
    },
    {
      // Background Job Processor
      name: 'agentcare-jobs',
      script: './backend/dist/services/JobProcessorService.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        JOB_CONCURRENCY: 5
      },
      env_production: {
        NODE_ENV: 'production',
        JOB_CONCURRENCY: 10
      },
      max_memory_restart: '512M',
      cron_restart: '0 */6 * * *', // Restart every 6 hours
      log_file: './logs/pm2/jobs.log'
    },
    {
      // Metrics Collector
      name: 'agentcare-metrics',
      script: './backend/dist/services/MetricsCollectorService.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        METRICS_PORT: 9090
      },
      env_production: {
        NODE_ENV: 'production',
        METRICS_PORT: 9090
      },
      max_memory_restart: '256M',
      log_file: './logs/pm2/metrics.log'
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'agentcare',
      host: ['production-server-1', 'production-server-2'],
      ref: 'origin/main',
      repo: 'git@github.com:vishalm/agentcare.git',
      path: '/var/www/agentcare',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    staging: {
      user: 'agentcare',
      host: 'staging-server',
      ref: 'origin/develop',
      repo: 'git@github.com:vishalm/agentcare.git',
      path: '/var/www/agentcare-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging'
    }
  }
}; 