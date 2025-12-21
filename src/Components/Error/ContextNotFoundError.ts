import type { SafeContext } from "it";

import { SafeContextError } from "./SafeContextError";

/**
 * Error thrown when a required context is accessed via
 * {@link SafeContext.require `require()`} but has not been set.
 */
class ContextNotFoundError extends SafeContextError {
    override name = "ContextNotFoundError";

    /**
     * @param key The key of the missing context.
     * @param message A custom error message provided by the caller.
     */
    constructor(key: string, message?: string) {
        super(message ?? `context with key '${key}' is required but was not found`);
    }
}

export { ContextNotFoundError };
