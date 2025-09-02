import type { SetArgs, SetContextArgs } from "~/Types/Args/SetArgs";

import { isGetContextArgs } from "./IsGetContextArgs";

// @ts-ignore
declare function isSetContextArgs(args: SetArgs): args is SetContextArgs;
// @ts-ignore
const isSetContextArgs = isGetContextArgs;

export { isSetContextArgs };
