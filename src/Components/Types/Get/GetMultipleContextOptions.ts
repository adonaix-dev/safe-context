import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { GetContextOptions } from "./GetContextOptions";

/**
 * Options for retrieving multiple context values.
 *
 * @template PartialContext A subset of the main context dictionary.
 */
type GetMultipleContextOptions<PartialContext extends ContextDictionary> = {
    [Key in keyof PartialContext]?: GetContextOptions<PartialContext[Key]>;
};

export type { GetMultipleContextOptions };
