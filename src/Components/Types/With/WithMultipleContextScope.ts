import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { WithContextReturn } from "./WithContextReturn";
import type { WithMultipleContextOptions } from "./WithMultipleContextOptions";

type WithMultipleContextScope<
    Arg extends ContextDictionary,
    Options extends WithMultipleContextOptions<Arg>,
> = {
    readonly [Key in keyof Arg]: WithContextReturn<Arg[Key], Options[Key]>;
};

export type { WithMultipleContextScope };
