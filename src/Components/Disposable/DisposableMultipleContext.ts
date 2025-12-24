import type { Mutable } from "@adonaix/types";

import { MissingDependencyError } from "~/Error/MissingDependencyError";
import { FinalContextMutationError } from "~/Registry/Entry/Error/FinalContextMutationError";
import { mapDictionary } from "~/Util/MapDictionary";
import type { ContextRegistry } from "~/Registry/ContextRegistry";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { DisposableMultipleContext as IDisposableMultipleContext } from "~/Types/Disposable/DisposableMultipleContext";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";
import type { WithMultipleContextScope } from "~/Types/With/WithMultipleContextScope";

import { DisposableContext } from "./DisposableContext";

class DisposableMultipleContext<
    Ctxs extends ContextDictionary,
    Options extends WithMultipleContextOptions<Ctxs>,
> implements IDisposableMultipleContext<Ctxs, Options> {
    readonly #stack = new DisposableStack();

    private constructor(
        stack: DisposableStack,
        readonly scope: WithMultipleContextScope<Ctxs, Options>,
    ) {
        this.#stack = stack;
    }

    static create<
        Ctxs extends ContextDictionary,
        Options extends WithMultipleContextOptions<Ctxs>,
    >(
        contexts: Ctxs,
        registry: ContextRegistry<any>,
        options?: Options,
    ): DisposableMultipleContext<Ctxs, Options> {
        MissingDependencyError.assert("Symbol.dispose", "DisposableStack");

        const stack = new DisposableStack();
        const scope = mapDictionary(contexts, (context, key) => {
            const entry =
                (options?.[key]?.local ?? true)
                    ? registry.getLocalEntry(key)
                    : registry.getAsGlobalAsPossibleEntry(key);

            try {
                const disposable = new DisposableContext(entry, context, {
                    ...(options?.[key] ?? {}),
                    force: false,
                });

                stack.use(disposable);
                return disposable;
            } catch (error: unknown) {
                stack.dispose();

                throw (error as FinalContextMutationError).withKey(key as string);
            }
        });

        return new DisposableMultipleContext(stack, Object.freeze(scope));
    }

    [Symbol.dispose](): void {
        this.#stack.dispose();
    }
}

export { DisposableMultipleContext };
