import type { ContextDictionary } from "~/Types/ContextDictionary";

type MulticontextSetReturn<Arg extends ContextDictionary> = {
    [Key in keyof Arg]: boolean;
};

export type { MulticontextSetReturn };
