import z from "zod";

import type { Schema } from "~/Types/Schema";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";

const SetContextOptionsSchema = (): Schema<SetContextOptions> =>
    z.object({
        final: z.boolean().optional(),
        override: z.boolean().optional(),
        local: z.boolean().optional(),
    });

export { SetContextOptionsSchema };
