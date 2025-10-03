import type { ContextDictionary } from "./ContextDictionary";

interface SafeContextOptions<Dictionary extends ContextDictionary> {
    hideKeys?: true | (keyof Dictionary)[];
}

export type { SafeContextOptions };
