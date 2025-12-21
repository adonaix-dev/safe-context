import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetContextOptions } from "./SetContextOptions";

/**
 * Options for setting multiple context values.
 *
 * @template Ctxs A subset of the main context dictionary.
 */
type SetMultipleContextOptions<Ctxs extends ContextDictionary> = {
    [Key in keyof Ctxs]?: SetContextOptions;
};

export type { SetMultipleContextOptions };
