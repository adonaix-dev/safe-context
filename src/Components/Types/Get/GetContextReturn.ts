import type { GetContextOptions } from "./GetContextOptions";

type GetContextReturn<Type, Options extends GetContextOptions<Type>> = Options extends {
    supply: any;
}
    ? Type
    : Type | undefined;

export type { GetContextReturn };
