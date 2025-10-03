import type { SafeContext } from "it";

import type { ContextDictionary } from "~/Types/ContextDictionary";

/**
 * Options for the
 * {@link SafeContext.concurrentlySafe `concurrentlySafe()`} method.
 */
interface ConcurrentlySafeOptions<Dictionary extends ContextDictionary> {
    /**
     * Controls how contexts are inherited from the parent scope into
     * the new isolated scope, ensuring a predictable state for the
     * callback.
     *
     * You can provide an array of keys to copy only specific
     * contexts, or `"current"` to create a complete snapshot by
     * copying all currently set contexts.
     */
    contexts?: (keyof Dictionary)[] | "current";
}

export type { ConcurrentlySafeOptions };
