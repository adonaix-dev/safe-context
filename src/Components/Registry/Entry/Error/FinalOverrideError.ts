import { SafeContextErrorCode } from "~/Error/Code/SafeContextErrorCode";
import { SafeContextError } from "~/Error/SafeContextError";

class FinalOverrideError extends SafeContextError {
    override name = "FinalOverrideError";

    constructor() {
        super(SafeContextErrorCode.FinalOverride);
    }

    override formatWithKey(key: string): this {
        return (
            (this.message = `cannot set context with key '${key}'. This context is set and marked as final, and final contexts cannot be overriden`),
            this
        );
    }
}

export { FinalOverrideError };
