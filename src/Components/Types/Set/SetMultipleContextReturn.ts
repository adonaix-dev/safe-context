import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetContextReturn } from "./SetContextReturn";
import type { SetMultipleContextOptions } from "./SetMultipleContextOptions";

type SetMultipleContextReturn<
    Arg extends ContextDictionary,
    Options extends SetMultipleContextOptions<Arg>,
> = {
    [Key in keyof Arg]: SetContextReturn<Options[Key]>;
};

export type { SetMultipleContextReturn };
