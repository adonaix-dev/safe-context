import type { SafeContext } from "it";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";
import type { WithMultipleContextScope } from "~/Types/With/WithMultipleContextScope";

/**
 * An object returned by {@link SafeContext.with `with()`} for multiple
 * contexts. It is meant to be used with a `using` statement.
 */
interface DisposableMultipleContext<
    Arg extends ContextDictionary,
    Options extends WithMultipleContextOptions<Arg>,
> extends Disposable {
    /**
     * An object containing the disposable details for each context
     * key that was set.
     */
    readonly scope: WithMultipleContextScope<Arg, Options>;
}

export type { DisposableMultipleContext };
