import z from "zod";

import type { SafeContextOptions } from "~/Types/SafeContextOptions";
import type { Schema } from "~/Types/Schema";

const SafeContextOptionsSchema = (): Schema<SafeContextOptions<any>> =>
    z.object({
        hideKeys: z.union([z.literal(true), z.array(z.string())]).optional(),
    });

export { SafeContextOptionsSchema };
