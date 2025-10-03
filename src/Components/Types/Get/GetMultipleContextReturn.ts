import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { GetContextReturn } from "./GetContextReturn";
import type { GetMultipleContextOptions } from "./GetMultipleContextOptions";

/**
 * The return type when getting multiple contexts. It's an object
 * where keys are the context keys and values are their retrieved
 * values.
 *
 * @template PartialContext A subset of the main context dictionary.
 * @template Options The get options provided.
 */
type GetMultipleContextReturn<
    PartialContext extends ContextDictionary,
    Options extends GetMultipleContextOptions<PartialContext>,
> = {
    [Key in keyof PartialContext]: GetContextReturn<PartialContext[Key], Options[Key]>;
};

export type { GetMultipleContextReturn };
