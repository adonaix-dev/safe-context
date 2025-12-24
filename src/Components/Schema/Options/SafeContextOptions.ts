import z from "zod";

import { KeySchema } from "~/Schema/Key";
import type { SafeContextOptions } from "~/Types/SafeContextOptions";
import type { Schema } from "~/Types/Schema";

const SafeContextOptionsSchema = (): Schema<SafeContextOptions<any>> =>
    z.object({
        hideKeys: z.union([z.literal(true), z.array(KeySchema())]).optional(),
    });

export { SafeContextOptionsSchema };
