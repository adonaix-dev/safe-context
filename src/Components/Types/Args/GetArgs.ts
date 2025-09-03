import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { GetContextOptions } from "~/Types/Options/GetContextOptions";
import type { GetMultipleContextOptions } from "~/Types/Options/GetMultipleContextOptions";

type GetContextArgs = [string, options?: GetContextOptions<ContextDictionary>];
type GetMulticontextArgs = [
    string[],
    options?: GetMultipleContextOptions<ContextDictionary, string>,
];

type GetArgs = GetContextArgs | GetMulticontextArgs;

export type { GetArgs, GetContextArgs, GetMulticontextArgs };
