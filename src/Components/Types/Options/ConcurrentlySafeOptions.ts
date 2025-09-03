import type { ContextDictionary } from "~/Types/ContextDictionary";

interface ConcurrentlySafeOptions<Dictionary extends ContextDictionary> {
    contexts?: (keyof Dictionary)[];
}

export type { ConcurrentlySafeOptions };
