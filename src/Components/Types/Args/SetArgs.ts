import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { ContextSetOptions } from "~/Types/Options/ContextSetOptions";
import type { MulticontextSetOptions } from "~/Types/Options/MulticontextSetOptions";

type SetContextArgs = [string, any, options?: ContextSetOptions];
type SetMulticontextArgs = [
    ContextDictionary,
    options?: MulticontextSetOptions<ContextDictionary>,
];

type SetArgs = SetContextArgs | SetMulticontextArgs;

export type { SetArgs, SetContextArgs, SetMulticontextArgs };
