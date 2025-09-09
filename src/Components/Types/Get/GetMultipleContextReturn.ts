import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { GetContextReturn } from "./GetContextReturn";
import type { GetMultipleContextOptions } from "./GetMultipleContextOptions";

type GetMultipleContextReturn<
    PartialContext extends ContextDictionary,
    Options extends GetMultipleContextOptions<PartialContext>,
> = {
    [Key in keyof PartialContext]: GetContextReturn<PartialContext[Key], Options[Key]>;
};

export type { GetMultipleContextReturn };
