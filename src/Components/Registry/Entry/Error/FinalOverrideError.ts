import { SafeContextError } from "~/Error/SafeContextError";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";

/**
 * Error thrown when attempting to override a context that was marked
 * as {@link SetContextOptions.final `final`}.
 */
class FinalOverrideError extends SafeContextError {
    override name = "FinalOverrideError";

    constructor() {
        super(
            "cannot set context. The context is set and marked as final, and final contexts cannot be overriden",
        );
    }

    /**
     * Attaches the key of the context that caused the error to the
     * error message.
     *
     * @param key The key of the context that could not be overridden.
     *
     * @returns The error instance for chaining.
     */
    withKey(key: string): this {
        return (
            (this.message = `cannot set context with key '${key}'. This context is set and marked as final, and final contexts cannot be overriden`),
            this
        );
    }
}

export { FinalOverrideError };
