import type { SafeContext } from "it";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";

/**
 * Options for setting multiple temporary contexts using
 * {@link SafeContext.with `with()`}.
 *
 * @see {@link SetMultipleContextOptions `SetMultipleContextOptions`}
 */
type WithMultipleContextOptions<Arg extends ContextDictionary> =
    SetMultipleContextOptions<Arg>;

export type { WithMultipleContextOptions };
