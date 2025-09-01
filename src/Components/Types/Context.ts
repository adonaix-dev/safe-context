import type { ContextDictionary } from "./ContextDictionary";

type Context<
    Dictionary extends ContextDictionary,
    Key extends keyof Dictionary = keyof Dictionary,
> = Dictionary[Key];

export type { Context };
