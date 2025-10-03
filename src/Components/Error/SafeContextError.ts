/**
 * Base error class for all errors thrown by `safe-context` package.
 */
abstract class SafeContextError extends Error {
    override name = "SafeContextError";
}

export { SafeContextError };
