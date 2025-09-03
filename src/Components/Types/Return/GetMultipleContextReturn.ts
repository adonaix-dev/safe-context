import type { Assert, Pretty } from "@adonaix/types";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { GetContextOptions } from "~/Types/Options/GetContextOptions";
import type { GetMultipleContextOptions } from "~/Types/Options/GetMultipleContextOptions";

import type { GetContextReturn } from "./GetContextReturn";

type GetMultipleContextReturn<
    Dictionary extends ContextDictionary,
    Keys extends keyof Dictionary,
    Options extends GetMultipleContextOptions<Dictionary, Keys>,
> = Pretty<
    {
        [Key in keyof Options]: GetContextReturn<
            Dictionary[Assert<Key, keyof Dictionary>],
            Assert<
                Options[Key],
                GetContextOptions<Dictionary[Assert<Key, keyof Dictionary>]>
            >
        >;
    } & Omit<
        {
            [Key in Keys]?: Dictionary[Key];
        },
        keyof Options
    >
>;

export type { GetMultipleContextReturn };
