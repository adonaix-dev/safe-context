import type { GetContextOptions } from "~/Types/Options/GetContextOptions";

type GetContextReturn<Type, Options extends GetContextOptions<Type>> =
    Options extends Required<GetContextOptions<any>> ? Type : Type | undefined;

export type { GetContextReturn };
