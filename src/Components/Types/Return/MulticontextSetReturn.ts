import type { ContextDictionary } from "~/Types/ContextDictionary";

type MulticontextSetReturn<Dictionary extends ContextDictionary> = {
    [Key in keyof Dictionary]: boolean;
};

export type { MulticontextSetReturn };
