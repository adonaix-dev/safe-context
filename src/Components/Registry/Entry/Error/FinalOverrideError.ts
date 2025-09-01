import { SafeContextErrorCode } from "~/Error/Code/SafeContextErrorCode";
import { SafeContextError } from "~/Error/SafeContextError";

class FinalOverrideError extends SafeContextError {
    constructor() {
        super(SafeContextErrorCode.FinalOverride);
    }

    override formatWithKey(key: string): this {
        return (
            (this.message = `cannot override context with key ${key}. This context is marked as final, and final contexts cannot be overriden`),
            this
        );
    }
}

export { FinalOverrideError };
