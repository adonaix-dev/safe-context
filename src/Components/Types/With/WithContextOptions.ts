import type { SafeContext } from "it";

import type { SetContextOptions } from "~/Types/Set/SetContextOptions";

/**
 * Options for setting a temporary context using
 * {@link SafeContext.with `with()`}.
 *
 * @see {@link SetContextOptions `SetContextOptions`}
 */
interface WithContextOptions extends SetContextOptions {
    /**
     * If `false`, the context is set on the global scope, not only on
     * the current async-local scope.
     *
     * @defaultValue `true`
     */
    local?: boolean;
}

export type { WithContextOptions };
