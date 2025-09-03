import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { SetContextOptions } from "~/Types/Options/SetContextOptions";
import type { SetMultipleContextOptions } from "~/Types/Options/SetMultipleContextOptions";

type SetContextArgs = [string, any, options?: SetContextOptions];
type SetMulticontextArgs = [
    ContextDictionary,
    options?: SetMultipleContextOptions<ContextDictionary>,
];

type SetArgs = SetContextArgs | SetMulticontextArgs;

export type { SetArgs, SetContextArgs, SetMulticontextArgs };
