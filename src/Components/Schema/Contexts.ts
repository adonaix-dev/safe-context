import z from "zod";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { Schema } from "~/Types/Schema";

const ContextsSchema = (): Schema<Partial<ContextDictionary>> =>
    z.record(z.string(), z.any());

export { ContextsSchema };
