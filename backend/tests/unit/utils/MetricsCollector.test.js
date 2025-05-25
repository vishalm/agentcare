"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MetricsCollector_1 = require("../../../backend/src/utils/MetricsCollector");
describe('MetricsCollector', () => {
    let metricsCollector;
    let mockLogger;
    beforeEach(() => {
        mockLogger = {
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        metricsCollector = new MetricsCollector_1.MetricsCollector(mockLogger);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Counter Metrics', () => {
        test('should increment counter with default value', () => {
            const metricName = 'test_counter';
            metricsCollector.incrementCounter(metricName);
            expect(metricsCollector.getMetric(metricName)).toBe(1);
        });
        test('should increment counter with custom value', () => {
            const metricName = 'test_counter';
            const value = 5;
            metricsCollector.incrementCounter(metricName, value);
            expect(metricsCollector.getMetric(metricName)).toBe(5);
        });
        test('should accumulate counter values', () => {
            const metricName = 'test_counter';
            metricsCollector.incrementCounter(metricName, 3);
            metricsCollector.incrementCounter(metricName, 2);
            expect(metricsCollector.getMetric(metricName)).toBe(5);
        });
    });
    describe('Timing Metrics', () => {
        test('should record timing metric', () => {
            const metricName = 'test_operation';
            const duration = 1500;
            metricsCollector.recordTiming(metricName, duration);
            expect(metricsCollector.getMetric(`${metricName}_timing`)).toBe(duration);
        });
        test('should track operation start and end', async () => {
            const operationName = 'test_operation';
            metricsCollector.startOperation(operationName);
            // Simulate some operation time
            await new Promise(resolve => setTimeout(resolve, 10));
            metricsCollector.endOperation(operationName);
            const timing = metricsCollector.getMetric(`${operationName}_timing`);
            expect(timing).toBeGreaterThan(0);
        });
    });
    describe('Error Metrics', () => {
        test('should record error for operation', () => {
            const operation = 'test_operation';
            metricsCollector.recordError(operation);
            expect(metricsCollector.getMetric(`${operation}_errors`)).toBe(1);
        });
        test('should accumulate error counts', () => {
            const operation = 'test_operation';
            metricsCollector.recordError(operation);
            metricsCollector.recordError(operation);
            metricsCollector.recordError(operation);
            expect(metricsCollector.getMetric(`${operation}_errors`)).toBe(3);
        });
    });
    describe('Metric Retrieval', () => {
        test('should return 0 for non-existent metric', () => {
            expect(metricsCollector.getMetric('non_existent')).toBe(0);
        });
        test('should return all metrics', () => {
            metricsCollector.incrementCounter('counter1', 5);
            metricsCollector.incrementCounter('counter2', 3);
            metricsCollector.recordTiming('operation1', 1000);
            const allMetrics = metricsCollector.getAllMetrics();
            expect(allMetrics.get('counter1')).toBe(5);
            expect(allMetrics.get('counter2')).toBe(3);
            expect(allMetrics.get('operation1_timing')).toBe(1000);
        });
        test('should export metrics as object', () => {
            metricsCollector.incrementCounter('test_counter', 10);
            metricsCollector.recordTiming('test_operation', 500);
            const exported = metricsCollector.exportMetrics();
            expect(exported).toEqual({
                test_counter: 10,
                test_operation_timing: 500
            });
        });
    });
    describe('Metric Reset', () => {
        test('should reset all metrics', () => {
            metricsCollector.incrementCounter('counter1', 5);
            metricsCollector.recordTiming('operation1', 1000);
            metricsCollector.resetMetrics();
            expect(metricsCollector.getMetric('counter1')).toBe(0);
            expect(metricsCollector.getMetric('operation1_timing')).toBe(0);
            expect(metricsCollector.getAllMetrics().size).toBe(0);
        });
        test('should log reset action', () => {
            metricsCollector.resetMetrics();
            expect(mockLogger.info).toHaveBeenCalledWith('Metrics reset');
        });
    });
});
//# sourceMappingURL=MetricsCollector.test.js.map