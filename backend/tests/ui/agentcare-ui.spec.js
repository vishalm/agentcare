"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
test_1.test.describe('AgentCare UI Tests', () => {
    test_1.test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });
    test_1.test.describe('Page Load and Layout', () => {
        (0, test_1.test)('should load the main page with correct title', async ({ page }) => {
            await (0, test_1.expect)(page).toHaveTitle(/AgentCare.*Multi-Agent Healthcare Scheduling/);
        });
        (0, test_1.test)('should display the main header', async ({ page }) => {
            await (0, test_1.expect)(page.locator('h1')).toContainText('AgentCare');
            await (0, test_1.expect)(page.locator('.header p')).toContainText('Multi-Agent Healthcare Scheduling System');
        });
        (0, test_1.test)('should display the agent status indicator', async ({ page }) => {
            await (0, test_1.expect)(page.locator('.agent-status')).toBeVisible();
            await (0, test_1.expect)(page.locator('.status-indicator')).toContainText('Multi-Agent System Active');
            await (0, test_1.expect)(page.locator('#agentType')).toContainText('Supervisor Agent Ready');
        });
        (0, test_1.test)('should display example buttons', async ({ page }) => {
            await (0, test_1.expect)(page.locator('.examples h3')).toContainText('Try these examples:');
            const exampleButtons = page.locator('.example-button');
            await (0, test_1.expect)(exampleButtons).toHaveCount(5);
            await (0, test_1.expect)(exampleButtons.nth(0)).toContainText('Book Appointment');
            await (0, test_1.expect)(exampleButtons.nth(1)).toContainText('Check Availability');
            await (0, test_1.expect)(exampleButtons.nth(2)).toContainText('Doctor Info');
            await (0, test_1.expect)(exampleButtons.nth(3)).toContainText('Preparation Info');
            await (0, test_1.expect)(exampleButtons.nth(4)).toContainText('Policies');
        });
        (0, test_1.test)('should display the chat interface', async ({ page }) => {
            await (0, test_1.expect)(page.locator('.messages')).toBeVisible();
            await (0, test_1.expect)(page.locator('#messageInput')).toBeVisible();
            await (0, test_1.expect)(page.locator('#sendButton')).toBeVisible();
            await (0, test_1.expect)(page.locator('#sendButton')).toContainText('Send');
        });
    });
    test_1.test.describe('Initial Chat State', () => {
        (0, test_1.test)('should display welcome message', async ({ page }) => {
            const welcomeMessage = page.locator('.agent-message').first();
            await (0, test_1.expect)(welcomeMessage).toBeVisible();
            await (0, test_1.expect)(welcomeMessage).toContainText('Welcome!');
            await (0, test_1.expect)(welcomeMessage).toContainText('intelligent healthcare scheduling assistant');
            await (0, test_1.expect)(welcomeMessage).toContainText('multi-agent system');
        });
        (0, test_1.test)('should show capabilities in welcome message', async ({ page }) => {
            const welcomeMessage = page.locator('.agent-message').first();
            await (0, test_1.expect)(welcomeMessage).toContainText('Booking appointments');
            await (0, test_1.expect)(welcomeMessage).toContainText('Checking doctor availability');
            await (0, test_1.expect)(welcomeMessage).toContainText('Getting information about doctors');
            await (0, test_1.expect)(welcomeMessage).toContainText('Answering policy questions');
        });
    });
    test_1.test.describe('User Input Interactions', () => {
        (0, test_1.test)('should allow typing in the message input', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            await messageInput.fill('Test message');
            await (0, test_1.expect)(messageInput).toHaveValue('Test message');
        });
        (0, test_1.test)('should send message on button click', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            const sendButton = page.locator('#sendButton');
            await messageInput.fill('Hello');
            await sendButton.click();
            // Should show user message in chat
            await (0, test_1.expect)(page.locator('.user-message').last()).toContainText('Hello');
            // Input should be cleared
            await (0, test_1.expect)(messageInput).toHaveValue('');
        });
        (0, test_1.test)('should send message on Enter key press', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            await messageInput.fill('Test Enter key');
            await messageInput.press('Enter');
            // Should show user message in chat
            await (0, test_1.expect)(page.locator('.user-message').last()).toContainText('Test Enter key');
            // Input should be cleared
            await (0, test_1.expect)(messageInput).toHaveValue('');
        });
        (0, test_1.test)('should not send empty messages', async ({ page }) => {
            const sendButton = page.locator('#sendButton');
            const initialMessageCount = await page.locator('.message').count();
            await sendButton.click();
            // Message count should remain the same
            await (0, test_1.expect)(page.locator('.message')).toHaveCount(initialMessageCount);
        });
    });
    test_1.test.describe('Example Button Interactions', () => {
        (0, test_1.test)('should populate input when example button is clicked', async ({ page }) => {
            const bookingButton = page.locator('.example-button').first();
            const messageInput = page.locator('#messageInput');
            await bookingButton.click();
            // Should send the message automatically
            await (0, test_1.expect)(page.locator('.user-message').last()).toContainText('cardiologist');
        });
        (0, test_1.test)('should trigger different agent responses for different examples', async ({ page }) => {
            // Test booking example
            await page.locator('.example-button').first().click();
            await (0, test_1.expect)(page.locator('#agentType')).toContainText('Booking Agent Active', { timeout: 5000 });
            // Wait for response and reset
            await page.waitForTimeout(1000);
            // Test availability example
            await page.locator('.example-button').nth(1).click();
            await (0, test_1.expect)(page.locator('#agentType')).toContainText('Availability Agent Active', { timeout: 5000 });
            // Wait for response and reset
            await page.waitForTimeout(1000);
            // Test doctor info example
            await page.locator('.example-button').nth(2).click();
            await (0, test_1.expect)(page.locator('#agentType')).toContainText('FAQ Agent Active', { timeout: 5000 });
        });
    });
    test_1.test.describe('Chat Conversation Flow', () => {
        (0, test_1.test)('should display loading state during message processing', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            const sendButton = page.locator('#sendButton');
            const loading = page.locator('#loading');
            await messageInput.fill('Test message');
            await sendButton.click();
            // Loading should be visible briefly
            await (0, test_1.expect)(loading).toBeVisible();
            await (0, test_1.expect)(loading).toContainText('Agent processing...');
            // Send button should be disabled during processing
            await (0, test_1.expect)(sendButton).toBeDisabled();
            // Wait for processing to complete
            await (0, test_1.expect)(loading).not.toBeVisible({ timeout: 10000 });
            await (0, test_1.expect)(sendButton).not.toBeDisabled();
        });
        (0, test_1.test)('should display agent response after user message', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            const sendButton = page.locator('#sendButton');
            await messageInput.fill('I want to book an appointment');
            await sendButton.click();
            // Wait for agent response
            await (0, test_1.expect)(page.locator('.agent-message').last()).not.toContainText('Welcome!', { timeout: 10000 });
            const lastAgentMessage = page.locator('.agent-message').last();
            await (0, test_1.expect)(lastAgentMessage).toContainText('AgentCare Assistant');
        });
        (0, test_1.test)('should maintain conversation history', async ({ page }) => {
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
            await (0, test_1.expect)(page.locator('.user-message')).toHaveCount(2);
            await (0, test_1.expect)(page.locator('.user-message').first()).toContainText('Hello');
            await (0, test_1.expect)(page.locator('.user-message').last()).toContainText('I need help');
        });
    });
    test_1.test.describe('Agent Status Updates', () => {
        (0, test_1.test)('should update agent type based on message content', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            const agentType = page.locator('#agentType');
            // Test booking intent
            await messageInput.fill('I want to book an appointment');
            await messageInput.press('Enter');
            await (0, test_1.expect)(agentType).toContainText('Booking Agent Active', { timeout: 5000 });
            // Should reset after timeout
            await (0, test_1.expect)(agentType).toContainText('Supervisor Agent Ready', { timeout: 5000 });
        });
        (0, test_1.test)('should show processing state during requests', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            const agentType = page.locator('#agentType');
            await messageInput.fill('What doctors are available?');
            await messageInput.press('Enter');
            await (0, test_1.expect)(agentType).toContainText('Processing...', { timeout: 1000 });
        });
    });
    test_1.test.describe('Responsive Design', () => {
        (0, test_1.test)('should adapt to mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
            // Main container should still be visible
            await (0, test_1.expect)(page.locator('.container')).toBeVisible();
            // Chat interface should be functional
            await (0, test_1.expect)(page.locator('#messageInput')).toBeVisible();
            await (0, test_1.expect)(page.locator('#sendButton')).toBeVisible();
            // Example buttons should wrap properly
            await (0, test_1.expect)(page.locator('.example-buttons')).toBeVisible();
        });
        (0, test_1.test)('should work on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
            await (0, test_1.expect)(page.locator('.container')).toBeVisible();
            await (0, test_1.expect)(page.locator('.chat-container')).toBeVisible();
            // Test interaction on tablet
            await page.locator('#messageInput').fill('Test tablet');
            await page.locator('#sendButton').click();
            await (0, test_1.expect)(page.locator('.user-message').last()).toContainText('Test tablet');
        });
    });
    test_1.test.describe('Error Handling', () => {
        (0, test_1.test)('should handle network errors gracefully', async ({ page }) => {
            // Intercept API calls and simulate network error
            await page.route('/api/v1/agents/process', route => {
                route.abort('failed');
            });
            const messageInput = page.locator('#messageInput');
            await messageInput.fill('Test network error');
            await messageInput.press('Enter');
            // Should show error message
            await (0, test_1.expect)(page.locator('.agent-message').last()).toContainText('Connection error', { timeout: 10000 });
            await (0, test_1.expect)(page.locator('#agentType')).toContainText('Connection Error', { timeout: 5000 });
        });
        (0, test_1.test)('should handle server errors', async ({ page }) => {
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
            await (0, test_1.expect)(page.locator('.agent-message').last()).toContainText('Error:', { timeout: 10000 });
        });
    });
    test_1.test.describe('Accessibility', () => {
        (0, test_1.test)('should have proper focus management', async ({ page }) => {
            // Message input should be focused on load
            await (0, test_1.expect)(page.locator('#messageInput')).toBeFocused();
            // Tab navigation should work
            await page.keyboard.press('Tab');
            await (0, test_1.expect)(page.locator('#sendButton')).toBeFocused();
        });
        (0, test_1.test)('should have proper ARIA labels and roles', async ({ page }) => {
            // Check for important accessibility attributes
            await (0, test_1.expect)(page.locator('#messageInput')).toHaveAttribute('placeholder');
            await (0, test_1.expect)(page.locator('#sendButton')).toHaveAttribute('type', 'button');
        });
        (0, test_1.test)('should support keyboard navigation', async ({ page }) => {
            // Should be able to navigate and interact with keyboard only
            await page.locator('#messageInput').fill('Keyboard test');
            await page.keyboard.press('Tab'); // Focus send button
            await page.keyboard.press('Enter'); // Click send button
            await (0, test_1.expect)(page.locator('.user-message').last()).toContainText('Keyboard test');
        });
    });
    test_1.test.describe('Performance', () => {
        (0, test_1.test)('should load page within reasonable time', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('/');
            await page.locator('.container').waitFor();
            const loadTime = Date.now() - startTime;
            (0, test_1.expect)(loadTime).toBeLessThan(3000); // Should load within 3 seconds
        });
        (0, test_1.test)('should handle multiple rapid messages', async ({ page }) => {
            const messageInput = page.locator('#messageInput');
            // Send multiple messages rapidly
            for (let i = 0; i < 3; i++) {
                await messageInput.fill(`Message ${i + 1}`);
                await messageInput.press('Enter');
                await page.waitForTimeout(100); // Small delay
            }
            // All messages should be sent
            await (0, test_1.expect)(page.locator('.user-message')).toHaveCount(3);
        });
    });
});
//# sourceMappingURL=agentcare-ui.spec.js.map