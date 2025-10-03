import type { SafeContext } from "it";

import type { SetContextOptions } from "./SetContextOptions";

/**
 * The return type of a {@link SafeContext.set `set()`} operation. It's
 * `boolean` if {@link SetContextOptions.override `override`} is
 * explicitly `false`, otherwise `true`.
 *
 * @template Options The set options provided.
 */
type SetContextReturn<Options> = Options extends {
    override: false;
}
    ? boolean
    : true;

export type { SetContextReturn };
