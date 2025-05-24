"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Global test setup
beforeAll(() => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error'; // Reduce logging during tests
});
// Mock console methods to avoid cluttering test output
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
// Custom Jest matchers
expect.extend({
    toBeValidEmail(received) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
            pass,
        };
    },
    toBeValidPhone(received) {
        const digitsOnly = received.replace(/\D/g, '');
        const pass = digitsOnly.length === 10 || digitsOnly.length === 11;
        return {
            message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid phone number`,
            pass,
        };
    },
});
//# sourceMappingURL=setup.js.map