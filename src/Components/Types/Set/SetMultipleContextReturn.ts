import type { Assert } from "@adonaix/types";

import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetContextOptions } from "./SetContextOptions";
import type { SetContextReturn } from "./SetContextReturn";
import type { SetMultipleContextOptions } from "./SetMultipleContextOptions";

type SetMultipleContextReturn<
    Arg extends ContextDictionary,
    Options extends SetMultipleContextOptions<Arg>,
> = {
    [Key in keyof Arg]: SetContextReturn<Assert<Options[Key], SetContextOptions>>;
};

export type { SetMultipleContextReturn };
