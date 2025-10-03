import type { GetContextOptions } from "./GetContextOptions";

/**
 * The return type when getting a single context. It's the context
 * type, or `undefined` if not found and no
 * {@link GetContextOptions.supply `supply()`} option was provided.
 *
 * @template Type The type of the context value.
 * @template Options The get options provided.
 */
type GetContextReturn<Type, Options> = Options extends {
    supply: any;
}
    ? Type
    : Type | undefined;

export type { GetContextReturn };
