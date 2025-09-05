import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { GetContextOptions } from "./GetContextOptions";

type GetMultipleContextOptions<PartialContext extends ContextDictionary> = {
    [Key in keyof PartialContext]?: GetContextOptions<PartialContext[Key]>;
};

export type { GetMultipleContextOptions };
