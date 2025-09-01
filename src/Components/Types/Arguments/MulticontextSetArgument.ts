import type { ContextDictionary } from "~/Types/ContextDictionary";

type MulticontextSetArgument<
    Dictionary extends ContextDictionary,
    Key extends keyof Dictionary,
> = Pick<Dictionary, Key>;

export type { MulticontextSetArgument };
