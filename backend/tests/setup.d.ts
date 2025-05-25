declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidEmail(): R;
            toBeValidPhone(): R;
        }
    }
}
export {};
//# sourceMappingURL=setup.d.ts.map