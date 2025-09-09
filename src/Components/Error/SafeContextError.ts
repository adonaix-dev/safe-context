import type { SafeContextErrorCode } from "./SafeContextErrorCode";

abstract class SafeContextError extends Error {
    override name = "SafeContextError";

    constructor(readonly code: SafeContextErrorCode) {
        super();
    }

    abstract formatWithKey(key: string): this;
}

export { SafeContextError };
