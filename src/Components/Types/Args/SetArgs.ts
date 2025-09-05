import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";

type SetContextArgs = [string, any, options?: SetContextOptions];
type SetMulticontextArgs = [ContextDictionary, options?: SetMultipleContextOptions<any>];

type SetArgs = SetContextArgs | SetMulticontextArgs;

export type { SetArgs, SetContextArgs, SetMulticontextArgs };
