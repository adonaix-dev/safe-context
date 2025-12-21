import z from "zod";

import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { Schema } from "~/Types/Schema";

import { KeySchema } from "./Key";

const ContextsSchema = (): Schema<Partial<ContextDictionary>> =>
    z.record(KeySchema(), z.any());

export { ContextsSchema };
