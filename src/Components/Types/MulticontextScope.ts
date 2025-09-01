import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { ContextWithReturn } from "./ContextWithReturn";

type MulticontextScope<Dictionary extends ContextDictionary> = {
    [Key in keyof Dictionary]: ContextWithReturn<Dictionary[Key]>;
};

export type { MulticontextScope };
