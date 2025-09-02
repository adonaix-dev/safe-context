class SuppressedError extends Error {
    override name = "SuppressedError";

    constructor(
        public error: any,
        public suppressed: any,
        message?: string,
    ) {
        super(message);
    }
}

export { SuppressedError };
