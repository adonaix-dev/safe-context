import type { ContextDictionary } from "~/Types/ContextDictionary";

/**
 * Represents a snapshot of the current state of the context. It is a
 * partial representation of the dictionary, containing only the keys
 * that are currently set and visible.
 */
type ContextSnapshot<Dictionary extends ContextDictionary> = Partial<Dictionary>;

export type { ContextSnapshot };
