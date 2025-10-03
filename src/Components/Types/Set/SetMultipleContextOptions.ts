import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetContextOptions } from "./SetContextOptions";

/**
 * Options for setting multiple context values.
 *
 * @template Arg A subset of the main context dictionary.
 */
type SetMultipleContextOptions<Arg extends ContextDictionary> = {
    /**
     * Individual options for each key being set.
     */
    [Key in keyof Arg]?: SetContextOptions;
};

export type { SetMultipleContextOptions };
