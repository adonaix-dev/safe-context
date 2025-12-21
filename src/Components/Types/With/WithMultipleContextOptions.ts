import type { SafeContext } from "it";

import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { WithContextOptions } from "./WithContextOptions";

/**
 * Options for setting multiple temporary contexts using
 * {@link SafeContext.with `with()`}.
 *
 * @template Ctxs A subset of the main context dictionary.
 */
type WithMultipleContextOptions<Ctxs extends ContextDictionary> = {
    [Key in keyof Ctxs]?: WithContextOptions;
};

export type { WithMultipleContextOptions };
