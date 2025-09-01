import type { ContextEntry } from "~/Registry/Entry/ContextEntry";
import type { ContextDictionary } from "~/Types/ContextDictionary";

type ArgEntries<Arg extends ContextDictionary> = {
    [Key in keyof Arg]: ContextEntry<Arg[Key]>;
};

export type { ArgEntries };
