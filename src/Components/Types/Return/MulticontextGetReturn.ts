import type { Assert, Pretty } from "@adonaix/types";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { ContextGetOptions } from "~/Types/Options/ContextGetOptions";
import type { MulticontextGetOptions } from "~/Types/Options/MulticontextGetOptions";

import type { ContextGetReturn } from "./ContextGetReturn";

type MulticontextGetReturn<
    Dictionary extends ContextDictionary,
    Keys extends keyof Dictionary,
    Options extends MulticontextGetOptions<Dictionary, Keys>,
> = Pretty<
    {
        [Key in keyof Options]: ContextGetReturn<
            Dictionary[Assert<Key, keyof Dictionary>],
            Assert<
                Options[Key],
                ContextGetOptions<Dictionary[Assert<Key, keyof Dictionary>]>
            >
        >;
    } & Omit<
        {
            [Key in Keys]?: Dictionary[Key];
        },
        keyof Options
    >
>;

export type { MulticontextGetReturn };
