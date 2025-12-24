import type { key } from "@adonaix/types";

import { MissingDependencyError } from "~/Error/MissingDependencyError";
import { FinalContextMutationError } from "~/Registry/Entry/Error/FinalContextMutationError";
import type { ContextRegistry } from "~/Registry/ContextRegistry";
import type { ContextEntry } from "~/Registry/Entry/ContextEntry";
import type { ContextEntrySetOptions } from "~/Registry/Entry/Types/ContextEntrySetOptions";
import type { ContextEntrySnapshot } from "~/Registry/Entry/Types/ContextEntrySnapshot";
import type { DisposableContext as IDisposableContext } from "~/Types/Disposable/DisposableContext";
import type { WithContextChanged } from "~/Types/With/WithContextChanged";
import type { WithContextOptions } from "~/Types/With/WithContextOptions";

class DisposableContext<
    Type,
    Options extends WithContextOptions,
> implements IDisposableContext<Type, Options> {
    readonly #snapshot?: ContextEntrySnapshot<Type>;
    readonly #entry: ContextEntry<Type>;
    readonly #changed: boolean;

    get previous(): Type | undefined {
        return this.#snapshot?.context;
    }

    get changed(): WithContextChanged<Options> {
        return this.#changed as any;
    }

    constructor(
        entry: ContextEntry<Type>,
        readonly context: Type,
        options?: ContextEntrySetOptions,
    ) {
        this.#snapshot = entry.snapshot();
        this.#entry = entry;
        this.#changed = entry.set(context, options);
    }

    static create<Type, Options extends WithContextOptions>(
        key: key,
        context: Type,
        registry: ContextRegistry<any>,
        options?: Options,
    ): DisposableContext<Type, Options> {
        MissingDependencyError.assert("Symbol.dispose");

        const entry =
            (options?.local ?? true)
                ? registry.getLocalEntry(key)
                : registry.getAsGlobalAsPossibleEntry(key);

        try {
            return new DisposableContext(entry, context, {
                ...(options ?? {}),
                force: false,
            });
        } catch (error: unknown) {
            throw (error as FinalContextMutationError).withKey(key as string);
        }
    }

    [Symbol.dispose](): void {
        if (this.#changed) {
            if (this.#snapshot) {
                this.#entry.set(this.#snapshot.context, {
                    final: this.#snapshot.final,
                    force: true,
                });
            } else {
                this.#entry.unset();
            }
        }
    }
}

export { DisposableContext };
