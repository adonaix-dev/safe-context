import type { GetContextOptions } from "~/Types/Get/GetContextOptions";

import { ContextEntryState } from "./ContextEntryState";
import { FinalContextMutationError } from "./Error/FinalContextMutationError";
import { FinalContextMutationType } from "./Error/FinalContextMutationType";
import type { ContextEntrySetOptions } from "./Types/ContextEntrySetOptions";
import type { ContextEntrySnapshot } from "./Types/ContextEntrySnapshot";

class ContextEntry<Type> {
    private state: ContextEntryState = ContextEntryState.Unset;
    private context?: Type;
    private final: boolean = false;

    isFinal(): boolean {
        return this.final;
    }

    isSet(): boolean {
        return this.state === ContextEntryState.Set;
    }

    get(options: GetContextOptions<Type> = {}): Type | undefined {
        if (
            this.state === ContextEntryState.Unset &&
            typeof options.supply === "function"
        ) {
            const context = options.supply();

            this.set(context);
            return context;
        }

        return this.context;
    }

    set(
        context: Type,
        { final = false, override = true, force = false }: ContextEntrySetOptions = {},
    ): boolean {
        if (this.state === ContextEntryState.Set) {
            if (!override) return false;
            else if (this.final && !force) {
                throw new FinalContextMutationError(FinalContextMutationType.Set);
            }
        }

        this.state = ContextEntryState.Set;
        this.final = final;
        this.context = context;

        return true;
    }

    unset(): void {
        this.state = ContextEntryState.Unset;
        this.final = false;
        delete this.context;
    }

    snapshot(): ContextEntrySnapshot<Type> | undefined {
        if (this.state === ContextEntryState.Set) {
            return {
                context: this.context!,
                final: this.final,
            };
        }
    }

    copy(): ContextEntry<Type> {
        const entry = new ContextEntry<Type>();

        entry.state = this.state;
        entry.final = this.final;
        entry.context = this.context;

        return entry;
    }
}

export { ContextEntry };
