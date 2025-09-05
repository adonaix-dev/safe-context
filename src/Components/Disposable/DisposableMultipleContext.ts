import type { SafeContextError } from "~/Error/SafeContextError";
import type { ArgEntries } from "~/Types/Args/ArgEntries";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";
import type { WithMultipleContextScope } from "~/Types/With/WithMultipleContextScope";

import { DisposableContext } from "./DisposableContext";
import { DisposableStack } from "./Stack/DisposableStack";

const { entries, freeze, fromEntries } = Object;

class DisposableMultipleContext<
    Arg extends ContextDictionary,
    Options extends WithMultipleContextOptions<Arg>,
> implements Disposable
{
    readonly #stack = new DisposableStack();
    readonly scope: WithMultipleContextScope<Arg, Options>;

    constructor(
        arg: Arg,
        argEntries: ArgEntries<Arg>,
        options?: SetMultipleContextOptions<Arg>,
    ) {
        this.scope = freeze(
            fromEntries(
                entries(argEntries).map(([key, entry]) => {
                    try {
                        const disposable = new DisposableContext(
                            entry,
                            arg[key],
                            options?.[key],
                        );

                        this.#stack.use(disposable);
                        return [key, disposable];
                    } catch (error: unknown) {
                        this.#stack.dispose();
                        throw (error as SafeContextError).formatWithKey(key as string);
                    }
                }),
            ),
        ) as any;
    }

    [Symbol.dispose](): void {
        this.#stack.dispose();
    }
}

export { DisposableMultipleContext };
