import type { ContextGetOptions } from "~/Types/Options/ContextGetOptions";

type ContextGetReturn<Type, Options extends ContextGetOptions<Type>> =
    Options extends Required<ContextGetOptions<any>> ? Type : Type | undefined;

export type { ContextGetReturn };
