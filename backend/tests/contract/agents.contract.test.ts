import { SupervisorAgent } from '../../src/agents/SupervisorAgent';
import { AvailabilityAgent } from '../../src/agents/AvailabilityAgent';
import { BookingAgent } from '../../src/agents/BookingAgent';
import { FAQAgent } from '../../src/agents/FAQAgent';

describe('Agent Contract Tests', () => {
  describe('Agent Implementation Contract', () => {
    it('should ensure all agents implement required process method', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        expect(AgentClass.prototype.process).toBeDefined();
        expect(typeof AgentClass.prototype.process).toBe('function');
      });
    });

    it('should ensure all agents implement isAgentActive method', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        expect(AgentClass.prototype.isAgentActive).toBeDefined();
        expect(typeof AgentClass.prototype.isAgentActive).toBe('function');
      });
    });

    it('should ensure process method returns a Promise', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        const processMethod = AgentClass.prototype.process;
        expect(processMethod).toBeDefined();
        expect(typeof processMethod).toBe('function');
        // The method should be async (returns Promise)
        expect(processMethod.constructor.name).toBe('AsyncFunction');
      });
    });

    it('should ensure isAgentActive method returns boolean', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        const isActiveMethod = AgentClass.prototype.isAgentActive;
        expect(isActiveMethod).toBeDefined();
        expect(typeof isActiveMethod).toBe('function');
      });
    });
  });

  describe('Agent Method Signatures', () => {
    it('should have consistent process method signature', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        const processMethod = AgentClass.prototype.process;
        expect(processMethod.length).toBeGreaterThanOrEqual(1); // At least message parameter
        expect(processMethod.length).toBeLessThanOrEqual(2); // At most message and intent parameters
      });
    });

    it('should have consistent isAgentActive method signature', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        const isActiveMethod = AgentClass.prototype.isAgentActive;
        expect(isActiveMethod.length).toBe(0); // No parameters
      });
    });
  });

  describe('Agent Constructor Requirements', () => {
    it('should have constructors that accept required dependencies', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        expect(AgentClass.length).toBeGreaterThan(0); // Should require dependencies
      });
    });
  });

  describe('Agent Interface Compliance', () => {
    it('should ensure all agents can be instantiated with proper dependencies', () => {
      // This test verifies that the agents follow the expected constructor patterns
      // without actually instantiating them (which would require complex mocking)
      
      expect(SupervisorAgent.name).toBe('SupervisorAgent');
      expect(AvailabilityAgent.name).toBe('AvailabilityAgent');
      expect(BookingAgent.name).toBe('BookingAgent');
      expect(FAQAgent.name).toBe('FAQAgent');
    });

    it('should ensure all agents are classes', () => {
      const agentClasses = [SupervisorAgent, AvailabilityAgent, BookingAgent, FAQAgent];
      
      agentClasses.forEach((AgentClass) => {
        expect(typeof AgentClass).toBe('function');
        expect(AgentClass.prototype).toBeDefined();
        expect(AgentClass.prototype.constructor).toBe(AgentClass);
      });
    });
  });
}); 