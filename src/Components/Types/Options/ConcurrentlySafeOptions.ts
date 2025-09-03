import type { ContextDictionary } from "~/Types/ContextDictionary";

interface ConcurrentlySafeOptions<Dictionary extends ContextDictionary> {
    contexts?: (keyof Dictionary)[] | "all";
}

export type { ConcurrentlySafeOptions };
