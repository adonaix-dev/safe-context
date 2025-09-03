import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { GetContextOptions } from "./GetContextOptions";

type GetMultipleContextOptions<
    Dictionary extends ContextDictionary,
    Keys extends keyof Dictionary,
> = {
    [Key in Keys]?: GetContextOptions<Dictionary[Key]>;
};

export type { GetMultipleContextOptions };
