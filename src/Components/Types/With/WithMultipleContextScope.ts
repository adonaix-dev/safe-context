import type { SafeContext } from "it";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { DisposableMultipleContext } from "~/Types/Disposable/DisposableMultipleContext";

import type { WithContextReturn } from "./WithContextReturn";
import type { WithMultipleContextOptions } from "./WithMultipleContextOptions";

/**
 * Represents the {@link DisposableMultipleContext.scope `scope`}
 * object returned by {@link SafeContext.with `with()`} when setting
 * multiple contexts. It's a dictionary of
 * {@link WithContextReturn `WithContextReturn`} objects.
 */
type WithMultipleContextScope<
    Arg extends ContextDictionary,
    Options extends WithMultipleContextOptions<Arg>,
> = {
    readonly [Key in keyof Arg]: WithContextReturn<Arg[Key], Options[Key]>;
};

export type { WithMultipleContextScope };
