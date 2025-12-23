import { SafeContextError } from "~/Error/SafeContextError";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";

import type { FinalContextMutationType } from "./FinalContextMutationType";

/**
 * Error thrown when attempting to mutate a context that was marked as
 * {@link SetContextOptions.final `final`}.
 */
class FinalContextMutationError extends SafeContextError {
    override name = "FinalContextMutationError";

    private readonly mutation!: FinalContextMutationType;

    constructor(mutation: FinalContextMutationType) {
        super(
            `cannot ${mutation} context. The context is set and marked as final, and final contexts cannot be overriden`,
        );

        Object.defineProperty(this, "mutation", {
            value: mutation,
            writable: false,
            configurable: true,
            enumerable: false,
        });
    }

    /**
     * Attaches the key of the context that caused the error to the
     * error message.
     *
     * @param key The key of the context that could not be mutated.
     *
     * @returns The error instance for chaining.
     */
    withKey(key: string): this {
        return (
            (this.message = `cannot ${this.mutation} context with key '${key}'. This context is set and marked as final, and final contexts cannot be overriden`),
            this
        );
    }
}

export { FinalContextMutationError };
