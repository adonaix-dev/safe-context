import type { ContextDictionary } from "~/Types/ContextDictionary";

type SetMultipleContextReturn<Arg extends ContextDictionary> = {
    [Key in keyof Arg]: boolean;
};

export type { SetMultipleContextReturn };
