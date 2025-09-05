import type { Assert } from "@adonaix/types";

import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { WithContextOptions } from "./WithContextOptions";
import type { WithContextReturn } from "./WithContextReturn";
import type { WithMultipleContextOptions } from "./WithMultipleContextOptions";

type WithMultipleContextScope<
    Arg extends ContextDictionary,
    Options extends WithMultipleContextOptions<Arg>,
> = {
    readonly [Key in keyof Arg]: WithContextReturn<
        Arg[Key],
        Assert<Options[Key], WithContextOptions>
    >;
};

export type { WithMultipleContextScope };
