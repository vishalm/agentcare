import { test, expect } from '@playwright/test';

test.describe('AgentCare UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Page Load and Layout', () => {
    test('should load the main page with correct title', async ({ page }) => {
      await expect(page).toHaveTitle(/AgentCare.*Multi-Agent Healthcare Scheduling/);
    });

    test('should display the main header', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('AgentCare');
      await expect(page.locator('.header p')).toContainText('Multi-Agent Healthcare Scheduling System');
    });

    test('should display the agent status indicator', async ({ page }) => {
      await expect(page.locator('.agent-status')).toBeVisible();
      await expect(page.locator('.status-indicator')).toContainText('Multi-Agent System Active');
      await expect(page.locator('#agentType')).toContainText('Supervisor Agent Ready');
    });

    test('should display example buttons', async ({ page }) => {
      await expect(page.locator('.examples h3')).toContainText('Try these examples:');
      
      const exampleButtons = page.locator('.example-button');
      await expect(exampleButtons).toHaveCount(5);
      
      await expect(exampleButtons.nth(0)).toContainText('Book Appointment');
      await expect(exampleButtons.nth(1)).toContainText('Check Availability');
      await expect(exampleButtons.nth(2)).toContainText('Doctor Info');
      await expect(exampleButtons.nth(3)).toContainText('Preparation Info');
      await expect(exampleButtons.nth(4)).toContainText('Policies');
    });

    test('should display the chat interface', async ({ page }) => {
      await expect(page.locator('.messages')).toBeVisible();
      await expect(page.locator('#messageInput')).toBeVisible();
      await expect(page.locator('#sendButton')).toBeVisible();
      await expect(page.locator('#sendButton')).toContainText('Send');
    });
  });

  test.describe('Initial Chat State', () => {
    test('should display welcome message', async ({ page }) => {
      const welcomeMessage = page.locator('.agent-message').first();
      await expect(welcomeMessage).toBeVisible();
      await expect(welcomeMessage).toContainText('Welcome!');
      await expect(welcomeMessage).toContainText('intelligent healthcare scheduling assistant');
      await expect(welcomeMessage).toContainText('multi-agent system');
    });

    test('should show capabilities in welcome message', async ({ page }) => {
      const welcomeMessage = page.locator('.agent-message').first();
      await expect(welcomeMessage).toContainText('Booking appointments');
      await expect(welcomeMessage).toContainText('Checking doctor availability');
      await expect(welcomeMessage).toContainText('Getting information about doctors');
      await expect(welcomeMessage).toContainText('Answering policy questions');
    });
  });

  test.describe('User Input Interactions', () => {
    test('should allow typing in the message input', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      await messageInput.fill('Test message');
      await expect(messageInput).toHaveValue('Test message');
    });

    test('should send message on button click', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      const sendButton = page.locator('#sendButton');
      
      await messageInput.fill('Hello');
      await sendButton.click();
      
      // Should show user message in chat
      await expect(page.locator('.user-message').last()).toContainText('Hello');
      
      // Input should be cleared
      await expect(messageInput).toHaveValue('');
    });

    test('should send message on Enter key press', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      
      await messageInput.fill('Test Enter key');
      await messageInput.press('Enter');
      
      // Should show user message in chat
      await expect(page.locator('.user-message').last()).toContainText('Test Enter key');
      
      // Input should be cleared
      await expect(messageInput).toHaveValue('');
    });

    test('should not send empty messages', async ({ page }) => {
      const sendButton = page.locator('#sendButton');
      const initialMessageCount = await page.locator('.message').count();
      
      await sendButton.click();
      
      // Message count should remain the same
      await expect(page.locator('.message')).toHaveCount(initialMessageCount);
    });
  });

  test.describe('Example Button Interactions', () => {
    test('should populate input when example button is clicked', async ({ page }) => {
      const bookingButton = page.locator('.example-button').first();
      const messageInput = page.locator('#messageInput');
      
      await bookingButton.click();
      
      // Should send the message automatically
      await expect(page.locator('.user-message').last()).toContainText('cardiologist');
    });

    test('should trigger different agent responses for different examples', async ({ page }) => {
      // Test booking example
      await page.locator('.example-button').first().click();
      await expect(page.locator('#agentType')).toContainText('Booking Agent Active', { timeout: 5000 });
      
      // Wait for response and reset
      await page.waitForTimeout(1000);
      
      // Test availability example
      await page.locator('.example-button').nth(1).click();
      await expect(page.locator('#agentType')).toContainText('Availability Agent Active', { timeout: 5000 });
      
      // Wait for response and reset
      await page.waitForTimeout(1000);
      
      // Test doctor info example
      await page.locator('.example-button').nth(2).click();
      await expect(page.locator('#agentType')).toContainText('FAQ Agent Active', { timeout: 5000 });
    });
  });

  test.describe('Chat Conversation Flow', () => {
    test('should display loading state during message processing', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      const sendButton = page.locator('#sendButton');
      const loading = page.locator('#loading');
      
      await messageInput.fill('Test message');
      await sendButton.click();
      
      // Loading should be visible briefly
      await expect(loading).toBeVisible();
      await expect(loading).toContainText('Agent processing...');
      
      // Send button should be disabled during processing
      await expect(sendButton).toBeDisabled();
      
      // Wait for processing to complete
      await expect(loading).not.toBeVisible({ timeout: 10000 });
      await expect(sendButton).not.toBeDisabled();
    });

    test('should display agent response after user message', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      const sendButton = page.locator('#sendButton');
      
      await messageInput.fill('I want to book an appointment');
      await sendButton.click();
      
      // Wait for agent response
      await expect(page.locator('.agent-message').last()).not.toContainText('Welcome!', { timeout: 10000 });
      
      const lastAgentMessage = page.locator('.agent-message').last();
      await expect(lastAgentMessage).toContainText('AgentCare Assistant');
    });

    test('should maintain conversation history', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      
      // Send first message
      await messageInput.fill('Hello');
      await messageInput.press('Enter');
      
      // Wait for response
      await page.waitForTimeout(1000);
      
      // Send second message
      await messageInput.fill('I need help');
      await messageInput.press('Enter');
      
      // Should have multiple user messages
      await expect(page.locator('.user-message')).toHaveCount(2);
      await expect(page.locator('.user-message').first()).toContainText('Hello');
      await expect(page.locator('.user-message').last()).toContainText('I need help');
    });
  });

  test.describe('Agent Status Updates', () => {
    test('should update agent type based on message content', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      const agentType = page.locator('#agentType');
      
      // Test booking intent
      await messageInput.fill('I want to book an appointment');
      await messageInput.press('Enter');
      await expect(agentType).toContainText('Booking Agent Active', { timeout: 5000 });
      
      // Should reset after timeout
      await expect(agentType).toContainText('Supervisor Agent Ready', { timeout: 5000 });
    });

    test('should show processing state during requests', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      const agentType = page.locator('#agentType');
      
      await messageInput.fill('What doctors are available?');
      await messageInput.press('Enter');
      
      await expect(agentType).toContainText('Processing...', { timeout: 1000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      
      // Main container should still be visible
      await expect(page.locator('.container')).toBeVisible();
      
      // Chat interface should be functional
      await expect(page.locator('#messageInput')).toBeVisible();
      await expect(page.locator('#sendButton')).toBeVisible();
      
      // Example buttons should wrap properly
      await expect(page.locator('.example-buttons')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      
      await expect(page.locator('.container')).toBeVisible();
      await expect(page.locator('.chat-container')).toBeVisible();
      
      // Test interaction on tablet
      await page.locator('#messageInput').fill('Test tablet');
      await page.locator('#sendButton').click();
      await expect(page.locator('.user-message').last()).toContainText('Test tablet');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept API calls and simulate network error
      await page.route('/api/v1/agents/process', route => {
        route.abort('failed');
      });
      
      const messageInput = page.locator('#messageInput');
      await messageInput.fill('Test network error');
      await messageInput.press('Enter');
      
      // Should show error message
      await expect(page.locator('.agent-message').last()).toContainText('Connection error', { timeout: 10000 });
      await expect(page.locator('#agentType')).toContainText('Connection Error', { timeout: 5000 });
    });

    test('should handle server errors', async ({ page }) => {
      // Intercept API calls and return server error
      await page.route('/api/v1/agents/process', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      const messageInput = page.locator('#messageInput');
      await messageInput.fill('Test server error');
      await messageInput.press('Enter');
      
      // Should show error message
      await expect(page.locator('.agent-message').last()).toContainText('Error:', { timeout: 10000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper focus management', async ({ page }) => {
      // Message input should be focused on load
      await expect(page.locator('#messageInput')).toBeFocused();
      
      // Tab navigation should work
      await page.keyboard.press('Tab');
      await expect(page.locator('#sendButton')).toBeFocused();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Check for important accessibility attributes
      await expect(page.locator('#messageInput')).toHaveAttribute('placeholder');
      await expect(page.locator('#sendButton')).toHaveAttribute('type', 'button');
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Should be able to navigate and interact with keyboard only
      await page.locator('#messageInput').fill('Keyboard test');
      await page.keyboard.press('Tab'); // Focus send button
      await page.keyboard.press('Enter'); // Click send button
      
      await expect(page.locator('.user-message').last()).toContainText('Keyboard test');
    });
  });

  test.describe('Performance', () => {
    test('should load page within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.locator('.container').waitFor();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle multiple rapid messages', async ({ page }) => {
      const messageInput = page.locator('#messageInput');
      
      // Send multiple messages rapidly
      for (let i = 0; i < 3; i++) {
        await messageInput.fill(`Message ${i + 1}`);
        await messageInput.press('Enter');
        await page.waitForTimeout(100); // Small delay
      }
      
      // All messages should be sent
      await expect(page.locator('.user-message')).toHaveCount(3);
    });
  });
}); 