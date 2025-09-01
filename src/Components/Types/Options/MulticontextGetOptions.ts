import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { ContextGetOptions } from "./ContextGetOptions";

type MulticontextGetOptions<
    Dictionary extends ContextDictionary,
    Keys extends keyof Dictionary,
> = {
    [Key in Keys]?: ContextGetOptions<Dictionary[Key]>;
};

export type { MulticontextGetOptions };
