import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetContextReturn } from "./SetContextReturn";
import type { SetMultipleContextOptions } from "./SetMultipleContextOptions";

/**
 * The return type when setting multiple contexts. It's an object
 * where keys are the context keys and values are the results of their
 * respective set operations.
 *
 * @template Arg A subset of the main context dictionary.
 * @template Options The set options provided.
 */
type SetMultipleContextReturn<
    Arg extends ContextDictionary,
    Options extends SetMultipleContextOptions<Arg>,
> = {
    [Key in keyof Arg]: SetContextReturn<Options[Key]>;
};

export type { SetMultipleContextReturn };
