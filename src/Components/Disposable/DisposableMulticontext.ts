import type { SafeContextError } from "~/Error/SafeContextError";
import type { ArgEntries } from "~/Types/Args/ArgEntries";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { MulticontextScope } from "~/Types/MulticontextScope";
import type { MulticontextSetOptions } from "~/Types/Options/MulticontextSetOptions";

import { DisposableContext } from "./DisposableContext";
import { DisposableStack } from "./Stack/DisposableStack";

const { entries, freeze, fromEntries } = Object;

class DisposableMulticontext<Arg extends ContextDictionary> implements Disposable {
    readonly #stack = new DisposableStack();
    readonly scope: MulticontextScope<Arg>;

    constructor(
        arg: Arg,
        argEntries: ArgEntries<Arg>,
        options?: MulticontextSetOptions<Arg>,
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

export { DisposableMulticontext };
