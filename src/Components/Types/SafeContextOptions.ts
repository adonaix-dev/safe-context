import type { SafeContext } from "it";

import type { ContextDictionary } from "./ContextDictionary";

/**
 * Options for the {@link SafeContext `SafeContext`} constructor.
 */
interface SafeContextOptions<Dictionary extends ContextDictionary> {
    /**
     * Hides specified keys from being shown when the instance is
     * inspected (e.g., via `console.log`). If `true`, all keys are
     * hidden; or if an array of keys, only those keys are hidden.
     */
    hideKeys?: true | (keyof Dictionary)[];
}

export type { SafeContextOptions };
