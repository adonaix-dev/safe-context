import type { ContextDictionary } from "~/Types/ContextDictionary";

import { ContextEntry } from "./Entry/ContextEntry";
import { FinalContextMutationError } from "./Entry/Error/FinalContextMutationError";
import { FinalContextMutationType } from "./Entry/Error/FinalContextMutationType";

class ContextRegistry<Dictionary extends ContextDictionary> {
    private readonly registryMap: Map<
        keyof Dictionary,
        ContextEntry<Dictionary[keyof Dictionary]>
    > = new Map();

    constructor(
        private readonly parent?: ContextRegistry<Dictionary>,
        private readonly globalRegistry: ContextRegistry<Dictionary> = this,
    ) {}

    private *registries(): Generator<ContextRegistry<Dictionary>> {
        let registry: ContextRegistry<Dictionary> | undefined = this;

        while (registry) {
            yield registry;
            registry = registry.parent;
        }
    }

    private getExistingEntry<Key extends keyof Dictionary>(
        key: Key,
    ): ContextEntry<Dictionary[Key]> | undefined {
        for (const registry of this.registries()) {
            if (registry.registryMap.has(key)) {
                return registry.registryMap.get(key) as ContextEntry<Dictionary[Key]>;
            }
        }
    }

    getAsGlobalAsPossibleEntry<Key extends keyof Dictionary>(
        key: Key,
    ): ContextEntry<Dictionary[Key]> {
        const existingEntry = this.getExistingEntry(key);
        if (existingEntry) {
            return existingEntry;
        }

        const entry = new ContextEntry<Dictionary[Key]>();

        this.globalRegistry.registryMap.set(key, entry);
        return entry;
    }

    getLocalEntry<Key extends keyof Dictionary>(key: Key): ContextEntry<Dictionary[Key]> {
        if (this.registryMap.has(key)) {
            return this.registryMap.get(key) as ContextEntry<Dictionary[Key]>;
        }

        const existingEntry = this.getExistingEntry(key);
        if (existingEntry?.isFinal()) {
            return existingEntry;
        }

        const entry = existingEntry?.copy() ?? new ContextEntry();

        this.registryMap.set(key, entry);
        return entry;
    }

    getCurrentKeys(): Set<keyof Dictionary> {
        const keys = new Set<keyof Dictionary>();

        for (const registry of this.registries())
            for (const [key, entry] of registry.registryMap) {
                if (entry.isSet()) {
                    keys.add(key);
                }
            }

        return keys;
    }

    has(key: keyof Dictionary): boolean {
        for (const registry of this.registries()) {
            if (registry.registryMap.has(key)) {
                return registry.registryMap.get(key)!.isSet();
            }
        }

        return false;
    }

    clear(): void {
        for (const entry of this.registryMap.values()) {
            if (!entry.isFinal()) {
                entry.unset();
            }
        }
    }

    clearEntry(key: keyof Dictionary): void {
        const entry = this.registryMap.get(key);

        if (entry?.isFinal()) {
            throw new FinalContextMutationError(FinalContextMutationType.Clear).withKey(
                key as string,
            );
        }

        entry?.unset();
    }
}

export { ContextRegistry };
