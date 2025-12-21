import z from "zod";

import type { GetContextOptions } from "~/Types/Get/GetContextOptions";
import type { Schema } from "~/Types/Schema";

const GetContextOptionsSchema = (): Schema<GetContextOptions<any>> =>
    z.object({
        supply: z.function().optional(),
    });

export { GetContextOptionsSchema };
