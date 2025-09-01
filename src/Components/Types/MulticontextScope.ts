import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { ContextWithReturn } from "./Return/ContextWithReturn";

type MulticontextScope<Dictionary extends ContextDictionary> = {
    readonly [Key in keyof Dictionary]: ContextWithReturn<Dictionary[Key]>;
};

export type { MulticontextScope };
