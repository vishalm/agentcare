"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ValidationService_1 = require("../../../backend/src/services/ValidationService");
describe('ValidationService', () => {
    let validationService;
    let mockLogger;
    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        validationService = new ValidationService_1.ValidationService(mockLogger);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Email Validation', () => {
        test('should validate correct email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'email+tag@example.org',
                'user123@test-domain.com'
            ];
            validEmails.forEach(email => {
                expect(validationService.isValidEmail(email)).toBe(true);
            });
        });
        test('should reject invalid email formats', () => {
            const invalidEmails = [
                'invalid-email',
                '@example.com',
                'test@',
                'test@@example.com',
                'test@.com',
                '',
                'test.example.com'
            ];
            invalidEmails.forEach(email => {
                expect(validationService.isValidEmail(email)).toBe(false);
            });
        });
        test('should validate email using validation service', () => {
            expect(validationService.isValidEmail('test@example.com')).toBe(true);
            expect(validationService.isValidEmail('invalid-email')).toBe(false);
        });
    });
    describe('Phone Validation', () => {
        test('should validate correct phone formats', () => {
            const validPhones = [
                '1234567890',
                '11234567890',
                '(555) 123-4567',
                '555-123-4567',
                '+1 555 123 4567',
                '555.123.4567'
            ];
            validPhones.forEach(phone => {
                expect(validationService.isValidPhone(phone)).toBe(true);
            });
        });
        test('should reject invalid phone formats', () => {
            const invalidPhones = [
                '123',
                '123456789012345',
                'abc-def-ghij',
                '',
                '555-123'
            ];
            invalidPhones.forEach(phone => {
                expect(validationService.isValidPhone(phone)).toBe(false);
            });
        });
        test('should validate phone using validation service', () => {
            expect(validationService.isValidPhone('1234567890')).toBe(true);
            expect(validationService.isValidPhone('123')).toBe(false);
        });
    });
    describe('Booking Validation', () => {
        test('should validate complete booking details', async () => {
            // Create a date that's definitely a weekday during business hours
            const nextMonday = new Date();
            const daysUntilMonday = (1 + 7 - nextMonday.getDay()) % 7 || 7;
            nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
            nextMonday.setHours(14, 0, 0, 0); // 2 PM
            const validBooking = {
                doctorId: 1,
                patientName: 'John Doe',
                patientEmail: 'john@example.com',
                patientPhone: '1234567890',
                dateTime: nextMonday
            };
            const result = await validationService.validateBooking(validBooking);
            expect(result.isValid).toBe(true);
            expect(result.message).toBeUndefined();
        });
        test('should reject booking with missing required fields', async () => {
            const incompleteBooking = {
                doctorId: 1,
                patientName: 'John Doe'
                // Missing email and dateTime
            };
            const result = await validationService.validateBooking(incompleteBooking);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Patient email is required');
        });
        test('should reject booking with invalid email', async () => {
            const nextMonday = new Date();
            const daysUntilMonday = (1 + 7 - nextMonday.getDay()) % 7 || 7;
            nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
            nextMonday.setHours(14, 0, 0, 0);
            const invalidEmailBooking = {
                doctorId: 1,
                patientName: 'John Doe',
                patientEmail: 'invalid-email',
                dateTime: nextMonday
            };
            const result = await validationService.validateBooking(invalidEmailBooking);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Invalid email format');
        });
        test('should reject booking with past date', async () => {
            const pastDateBooking = {
                doctorId: 1,
                patientName: 'John Doe',
                patientEmail: 'john@example.com',
                dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
            };
            const result = await validationService.validateBooking(pastDateBooking);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Appointment date must be in the future');
        });
        test('should reject booking outside business hours', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(20, 0, 0, 0); // 8 PM
            const outsideHoursBooking = {
                doctorId: 1,
                patientName: 'John Doe',
                patientEmail: 'john@example.com',
                dateTime: tomorrow
            };
            const result = await validationService.validateBooking(outsideHoursBooking);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Appointments must be scheduled between 9 AM and 5 PM');
        });
        test('should reject weekend bookings', async () => {
            const nextSunday = new Date();
            nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
            nextSunday.setHours(14, 0, 0, 0); // 2 PM
            const weekendBooking = {
                doctorId: 1,
                patientName: 'John Doe',
                patientEmail: 'john@example.com',
                dateTime: nextSunday
            };
            const result = await validationService.validateBooking(weekendBooking);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Appointments cannot be scheduled on weekends');
        });
    });
    describe('Doctor Validation', () => {
        test('should validate complete doctor data', async () => {
            const validDoctor = {
                name: 'Dr. Sarah Johnson',
                specialization: 'Cardiology',
                email: 'sarah@hospital.com',
                phone: '1234567890',
                credentials: 'MD, FACC'
            };
            const result = await validationService.validateDoctor(validDoctor);
            expect(result.isValid).toBe(true);
            expect(result.message).toBeUndefined();
        });
        test('should reject doctor with missing name', async () => {
            const invalidDoctor = {
                specialization: 'Cardiology',
                email: 'sarah@hospital.com'
            };
            const result = await validationService.validateDoctor(invalidDoctor);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Doctor name is required');
        });
        test('should reject doctor with invalid email', async () => {
            const invalidDoctor = {
                name: 'Dr. Sarah Johnson',
                specialization: 'Cardiology',
                email: 'invalid-email'
            };
            const result = await validationService.validateDoctor(invalidDoctor);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Invalid email format');
        });
    });
    describe('FAQ Validation', () => {
        test('should validate complete FAQ data', async () => {
            const validFAQ = {
                category: 'appointment',
                question: 'How do I schedule an appointment?',
                answer: 'You can schedule an appointment by calling our office or using our online booking system.'
            };
            const result = await validationService.validateFAQ(validFAQ);
            expect(result.isValid).toBe(true);
            expect(result.message).toBeUndefined();
        });
        test('should reject FAQ with short question', async () => {
            const invalidFAQ = {
                category: 'test',
                question: 'Short?',
                answer: 'This is a valid answer that is long enough to pass validation.'
            };
            const result = await validationService.validateFAQ(invalidFAQ);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Question must be at least 10 characters long');
        });
        test('should reject FAQ with short answer', async () => {
            const invalidFAQ = {
                category: 'test',
                question: 'This is a valid question that is long enough?',
                answer: 'Short'
            };
            const result = await validationService.validateFAQ(invalidFAQ);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Answer must be at least 20 characters long');
        });
    });
    describe('Input Sanitization', () => {
        test('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello World<p>Test</p>';
            const result = validationService.sanitizeInput(input);
            expect(result).toBe('Hello WorldTest');
        });
        test('should trim whitespace', () => {
            const input = '   Hello World   ';
            const result = validationService.sanitizeInput(input);
            expect(result).toBe('Hello World');
        });
        test('should handle empty input', () => {
            expect(validationService.sanitizeInput('')).toBe('');
            expect(validationService.sanitizeInput(null)).toBe('');
            expect(validationService.sanitizeInput(undefined)).toBe('');
        });
    });
});
//# sourceMappingURL=ValidationService.test.js.map