import z from "zod";

import { KeySchema } from "~/Schema/Key";
import type { ConcurrentlySafeOptions } from "~/Types/ConcurrentlySafeOptions";
import type { Schema } from "~/Types/Schema";

const ConcurrentlySafeOptionsSchema = (): Schema<ConcurrentlySafeOptions<any>> =>
    z.object({
        contexts: z.union([z.literal("current"), z.array(KeySchema())]).optional(),
    });

export { ConcurrentlySafeOptionsSchema };
