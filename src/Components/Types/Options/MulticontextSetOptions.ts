import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { ContextSetOptions } from "./ContextSetOptions";

type MulticontextSetOptions<Argument extends ContextDictionary> = {
    [Key in keyof Argument]?: ContextSetOptions;
};

export type { MulticontextSetOptions };
