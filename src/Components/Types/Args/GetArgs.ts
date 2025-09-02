import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { ContextGetOptions } from "~/Types/Options/ContextGetOptions";
import type { MulticontextGetOptions } from "~/Types/Options/MulticontextGetOptions";

type GetContextArgs = [string, options?: ContextGetOptions<ContextDictionary>];
type GetMulticontextArgs = [
    string[],
    options?: MulticontextGetOptions<ContextDictionary, string>,
];

type GetArgs = GetContextArgs | GetMulticontextArgs;

export type { GetArgs, GetContextArgs, GetMulticontextArgs };
