/**
 * Interface that all agents must implement
 * Ensures consistent behavior across the agent system
 */
export interface IAgent {
  /**
   * Process a user message and return a response
   * @param message - The user's message
   * @param intent - Optional parsed intent from supervisor
   * @returns Promise<string> - The agent's response
   */
  process(message: string, intent?: any): Promise<string>;

  /**
   * Check if the agent is currently active/processing
   * @returns boolean - Whether the agent is active
   */
  isAgentActive(): boolean;
}
