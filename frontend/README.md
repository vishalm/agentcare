# AgentCare Frontend

## Modern Healthcare Scheduling Interface

This is the frontend application for AgentCare - a sophisticated healthcare appointment booking system with AI-powered conversation interface built with React, TypeScript, and Material-UI.

## 🚀 Features

### Core Functionality
- **AI Chat Interface**: Natural language appointment booking
- **Real-time Conversation**: Live chat with healthcare AI agents
- **Provider Availability**: Dynamic schedule viewing and booking
- **Appointment Management**: Create, view, modify, and cancel appointments
- **User Authentication**: Secure login and registration
- **Responsive Design**: Mobile-first, cross-device compatibility

### AI Agent Integration
- **Multi-Agent Chat**: Seamless conversation flow between specialized agents
- **Context Awareness**: Maintains conversation context across agent transfers
- **Smart Suggestions**: AI-powered appointment recommendations
- **FAQ Support**: Instant answers to common healthcare questions

## 🏗 Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and optimized builds)
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Yup validation
- **Charts**: Recharts for analytics
- **Icons**: Lucide React + MUI Icons
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ and npm 10+
- Backend API running (see `../backend/README.md`)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env.local
   # Edit with your API endpoints
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── chat/           # Chat interface components
│   ├── appointments/   # Appointment-related components
│   ├── providers/      # Provider management components
│   └── auth/           # Authentication components
├── pages/              # Route-level page components
│   ├── HomePage.tsx
│   ├── ChatPage.tsx
│   ├── AppointmentsPage.tsx
│   └── ProfilePage.tsx
├── services/           # API service layer
│   ├── api.ts          # Base API configuration
│   ├── auth.ts         # Authentication services
│   ├── agents.ts       # Agent communication
│   └── appointments.ts # Appointment services
├── store/              # State management
│   ├── auth.ts         # Authentication store
│   ├── chat.ts         # Chat state management
│   └── appointments.ts # Appointment state
├── agents/             # Frontend agent interfaces
│   ├── ChatAgent.ts    # Chat coordination
│   └── types.ts        # Agent type definitions
├── theme/              # MUI theme configuration
├── utils/              # Utility functions
└── main.tsx            # Application entry point
```

## 🎨 Component Architecture

### Base Components
```typescript
// Common reusable components
components/common/
├── Button.tsx
├── Input.tsx
├── Modal.tsx
├── LoadingSpinner.tsx
└── ErrorBoundary.tsx
```

### Chat Components
```typescript
// AI chat interface
components/chat/
├── ChatContainer.tsx      # Main chat interface
├── MessageList.tsx        # Message display
├── MessageInput.tsx       # User input
├── AgentStatus.tsx        # Agent availability
└── ConversationMemory.tsx # Context display
```

### Feature Components
```typescript
// Feature-specific components
components/appointments/
├── AppointmentCard.tsx
├── BookingForm.tsx
├── CalendarView.tsx
└── ProviderSelector.tsx
```

## 🤖 Agent Integration

### Chat Agent Interface
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentType?: 'supervisor' | 'booking' | 'availability' | 'faq';
  metadata?: {
    confidence?: number;
    suggestions?: string[];
    data?: any;
  };
}
```

### Agent Communication
```typescript
// Service for agent communication
export class AgentService {
  async sendMessage(message: string, context: ChatContext): Promise<AgentResponse> {
    // Send to backend agent system
  }

  async getAgentStatus(): Promise<AgentStatus[]> {
    // Get real-time agent status
  }
}
```

## 🎯 Development Scripts

### Development
```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # ESLint code checking
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:ui      # UI component tests
npm run test:e2e     # End-to-end tests
npm run coverage     # Test coverage report
```

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Healthcare-friendly color palette with accessibility compliance
- **Typography**: Inter font family for readability
- **Spacing**: 8px grid system
- **Breakpoints**: Mobile-first responsive design

### Component Standards
```typescript
// Component template
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

export const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick
}) => {
  // Component implementation
};
```

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimization
- High contrast mode support

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 600,    // Mobile landscape
  md: 900,    // Tablet
  lg: 1200,   // Desktop
  xl: 1536    // Large desktop
};
```

### Mobile-First Approach
- Progressive enhancement
- Touch-friendly interfaces
- Optimized for mobile performance
- Offline-capable features

## 🔄 State Management

### Zustand Stores
```typescript
// Authentication store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Chat store
interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}
```

### React Query Integration
```typescript
// API data fetching
const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAppointments(),
    refetchInterval: 30000 // Real-time updates
  });
};
```

## 🔒 Security

### Authentication
- JWT token management
- Automatic token refresh
- Secure storage practices
- Route protection

### Data Protection
- HIPAA-compliant data handling
- Encrypted local storage
- Secure API communication
- Privacy-first design

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with React Hooks Testing Library
- Service layer testing
- Store testing

### Integration Tests
- API integration testing
- Component interaction testing
- User flow testing

### E2E Tests
- Complete user journeys
- Cross-browser testing
- Mobile device testing

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy loading for route components
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
```

### Bundle Optimization
- Tree shaking
- Dynamic imports
- Image optimization
- Font optimization

### Runtime Performance
- Virtual scrolling for large lists
- Memoization with React.memo
- Efficient re-rendering patterns
- Service worker caching

## 🐳 Docker Support

### Development
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

### Production
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 📝 Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_ANALYTICS=false

# Development
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

## 🎨 Theme Customization

### Material-UI Theme
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#9aa7ff',
      dark: '#3f5fb7',
    },
    secondary: {
      main: '#764ba2',
      light: '#a678d5',
      dark: '#4a2472',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
  },
});
```

## 🤝 Contributing

### Code Standards
- Use TypeScript strict mode
- Follow React best practices
- Write comprehensive tests
- Use semantic commit messages
- Follow component naming conventions

### Pull Request Process
1. Create feature branch
2. Write tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on multiple devices

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Component Storybook**: `npm run storybook`
- **Development Tools**: React DevTools, Redux DevTools
- **API Documentation**: Backend Swagger UI
- **Issues**: GitHub Issues

---

Built with ❤️ for an intuitive healthcare experience. 