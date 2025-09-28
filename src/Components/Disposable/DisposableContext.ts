import type { ContextEntry } from "~/Registry/Entry/ContextEntry";
import type { ContextEntrySetOptions } from "~/Registry/Entry/Types/ContextEntrySetOptions";
import type { ContextEntrySnapshot } from "~/Registry/Entry/Types/ContextEntrySnapshot";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";
import type { WithContextChanged } from "~/Types/With/WithContextChanged";
import type { WithContextOptions } from "~/Types/With/WithContextOptions";
import type { WithContextReturn } from "~/Types/With/WithContextReturn";

class DisposableContext<Type, Options extends WithContextOptions>
    implements Disposable, WithContextReturn<Type, Options>
{
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
