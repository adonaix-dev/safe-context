import type { SafeContext } from "it";

import type { SetContextOptions } from "~/Types/Set/SetContextOptions";

/**
 * Options for setting a temporary context using
 * {@link SafeContext.with `with()`}.
 *
 * @see {@link SetContextOptions `SetContextOptions`}
 */
interface WithContextOptions extends SetContextOptions {}

export type { WithContextOptions };
