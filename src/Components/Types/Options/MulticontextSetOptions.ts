import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { ContextSetOptions } from "./ContextSetOptions";

type MulticontextSetOptions<Arg extends ContextDictionary> = {
    [Key in keyof Arg]?: ContextSetOptions;
};

export type { MulticontextSetOptions };
