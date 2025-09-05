import type { GetContextOptions } from "~/Types/Get/GetContextOptions";
import type { GetMultipleContextOptions } from "~/Types/Get/GetMultipleContextOptions";

type GetContextArgs = [string, options?: GetContextOptions<any>];
type GetMulticontextArgs = [string[], options?: GetMultipleContextOptions<any>];

type GetArgs = GetContextArgs | GetMulticontextArgs;

export type { GetArgs, GetContextArgs, GetMulticontextArgs };
