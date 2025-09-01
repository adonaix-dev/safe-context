import type { ContextGetOptions } from "~/Types/Options/ContextGetOptions";

import { ContextEntryState } from "./ContextEntryState";
import type { ContextEntrySetOptions } from "./Types/ContextEntrySetOptions";

class ContextEntry<Type> {
    state: ContextEntryState = ContextEntryState.Unset;
    private context?: Type;
    private final: boolean = false;

    get(options: ContextGetOptions<Type> = {}): Type | undefined {
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
                // must fail saying that cannot write to final values
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
}

export { ContextEntry };
