import type { SafeContextError } from "~/Error/SafeContextError";
import type { ArgEntries } from "~/Types/Arguments/ArgEntries";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { MulticontextScope } from "~/Types/MulticontextScope";
import type { MulticontextSetOptions } from "~/Types/Options/MulticontextSetOptions";

import { DisposableContext } from "./DisposableContext";

class DisposableMulticontext<Arg extends ContextDictionary> implements Disposable {
    readonly #stack = new DisposableStack();
    readonly scope: MulticontextScope<Arg>;

    constructor(
        arg: Arg,
        entries: ArgEntries<Arg>,
        options?: MulticontextSetOptions<Arg>,
    ) {
        this.scope = Object.fromEntries(
            Object.entries(entries).map(([key, entry]) => {
                try {
                    const disposable = new DisposableContext(
                        entry,
                        arg[key],
                        options?.[key],
                    );

                    this.#stack.use(disposable);
                    return [key, disposable];
                } catch (error: unknown) {
                    throw (error as SafeContextError).formatWithKey(key as string);
                }
            }),
        ) as any;
    }

    [Symbol.dispose](): void {
        this.#stack.dispose();
    }
}

export { DisposableMulticontext };
