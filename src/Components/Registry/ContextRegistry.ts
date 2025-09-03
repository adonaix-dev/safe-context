import type { ContextDictionary } from "~/Types/ContextDictionary";

import { ContextEntry } from "./Entry/ContextEntry";

class ContextRegistry<Dictionary extends ContextDictionary> {
    private readonly registryMap: Map<
        keyof Dictionary,
        ContextEntry<Dictionary[keyof Dictionary]>
    > = new Map();

    constructor(
        private readonly parent?: ContextRegistry<Dictionary>,
        private readonly mainRegistry: ContextRegistry<Dictionary> = this,
    ) {}

    private getExistingEntry<Key extends keyof Dictionary>(
        key: Key,
    ): ContextEntry<Dictionary[Key]> | undefined {
        if (this.registryMap.has(key)) {
            return this.registryMap.get(key) as ContextEntry<Dictionary[Key]>;
        }
        return this.parent?.getExistingEntry(key);
    }

    getAsGlobalAsPossibleEntry<Key extends keyof Dictionary>(
        key: Key,
    ): ContextEntry<Dictionary[Key]> {
        const existingEntry = this.getExistingEntry(key);
        if (existingEntry) {
            return existingEntry;
        }

        const entry = new ContextEntry<Dictionary[Key]>();

        this.rootRegistry.registryMap.set(key, entry);
        return entry;
    }

    getEntryWithinThisRegistry<Key extends keyof Dictionary>(
        key: Key,
    ): ContextEntry<Dictionary[Key]> {
        if (this.registryMap.has(key)) {
            return this.registryMap.get(key) as ContextEntry<Dictionary[Key]>;
        }

        const entry = this.getExistingEntry(key)?.copy() ?? new ContextEntry();

        this.registryMap.set(key, entry);
        return entry;
    }
}

export { ContextRegistry };
