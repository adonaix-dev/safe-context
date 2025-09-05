import type { Assert } from "@adonaix/types";

import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { GetContextOptions } from "./GetContextOptions";
import type { GetContextReturn } from "./GetContextReturn";
import type { GetMultipleContextOptions } from "./GetMultipleContextOptions";

type GetMultipleContextReturn<
    PartialContext extends ContextDictionary,
    Options extends GetMultipleContextOptions<PartialContext>,
> = {
    [Key in keyof PartialContext]: GetContextReturn<
        PartialContext[Key],
        Assert<Options[Key], GetContextOptions<any>>
    >;
};

export type { GetMultipleContextReturn };
