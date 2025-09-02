import type { GetArgs, GetContextArgs } from "~/Types/Args/GetArgs";

function isGetContextArgs(args: GetArgs): args is GetContextArgs {
    return typeof args[0] === "string";
}

export { isGetContextArgs };
