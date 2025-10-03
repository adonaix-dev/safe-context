import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";
import type { WithMultipleContextScope } from "~/Types/With/WithMultipleContextScope";

interface DisposableMultipleContext<
    Arg extends ContextDictionary,
    Options extends WithMultipleContextOptions<Arg>,
> extends Disposable {
    readonly scope: WithMultipleContextScope<Arg, Options>;
}

export type { DisposableMultipleContext };
