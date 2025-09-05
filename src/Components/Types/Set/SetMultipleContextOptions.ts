import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetContextOptions } from "./SetContextOptions";

type SetMultipleContextOptions<Arg extends ContextDictionary> = {
    [Key in keyof Arg]?: SetContextOptions;
};

export type { SetMultipleContextOptions };
