import { ContextEntryState } from "~/Registry/Entry/ContextEntryState";
import type { ContextEntry } from "~/Registry/Entry/ContextEntry";
import type { ContextEntrySnapshot } from "~/Registry/Entry/Types/ContextEntrySnapshot";
import type { ContextSetOptions } from "~/Types/Options/ContextSetOptions";
import type { ContextWithReturn } from "~/Types/Return/ContextWithReturn";

class DisposableContext<Type> implements Disposable, ContextWithReturn<Type> {
    readonly #previouslySet: boolean;
    readonly #snapshot?: ContextEntrySnapshot<Type>;

    readonly #entry: ContextEntry<Type>;
    readonly #changed: boolean;

    get previous(): Type | undefined {
        return this.#snapshot?.context;
    }

    get changed(): boolean {
        return this.#changed;
    }

    constructor(
        entry: ContextEntry<Type>,
        readonly context: Type,
        options?: ContextSetOptions,
    ) {
        this.#previouslySet = entry.state === ContextEntryState.Set;
        this.#snapshot = entry.snapshot();
        this.#entry = entry;
        this.#changed = entry.set(context, options);
    }

    [Symbol.dispose](): void {
        if (this.#changed) {
            if (this.#previouslySet) {
                this.#entry.set(this.#snapshot!.context, {
                    final: this.#snapshot!.final,
                    force: true,
                });
            } else {
                this.#entry.unset();
            }
        }
    }
}

export { DisposableContext };
