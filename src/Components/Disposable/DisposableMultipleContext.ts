import { FinalOverrideError } from "~/Registry/Entry/Error/FinalOverrideError";
import type { ArgEntries } from "~/Types/Args/ArgEntries";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";
import type { WithMultipleContextScope } from "~/Types/With/WithMultipleContextScope";

import { DisposableContext } from "./DisposableContext";

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
        this.scope = Object.freeze(
            Object.fromEntries(
                Object.entries(argEntries).map(([key, entry]) => {
                    try {
                        const disposable = new DisposableContext(entry, arg[key], {
                            ...(options?.[key] ?? {}),
                            force: false,
                        });

                        this.#stack.use(disposable);
                        return [key, disposable];
                    } catch (error: unknown) {
                        this.#stack.dispose();

                        throw error instanceof FinalOverrideError
                            ? error.withKey(key)
                            : error;
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
