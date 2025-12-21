import type { Schema } from "~/Types/Schema";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";

import { SetMultipleContextOptionsSchema } from "./SetMultipleContextOptions";

const WithMultipleContextOptionsSchema: () => Schema<WithMultipleContextOptions<any>> =
    SetMultipleContextOptionsSchema;

export { WithMultipleContextOptionsSchema };
