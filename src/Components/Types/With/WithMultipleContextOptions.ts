import type { ContextDictionary } from "~/Types/ContextDictionary";

import type { SetMultipleContextOptions } from "./SetMultipleContextOptions";

type WithMultipleContextOptions<Arg extends ContextDictionary> =
    SetMultipleContextOptions<Arg>;

export type { WithMultipleContextOptions };
