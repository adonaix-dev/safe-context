import z from "zod";

import type { Schema } from "~/Types/Schema";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";

import { SetContextOptionsSchema } from "./SetContextOptions";

const SetMultipleContextOptionsSchema = (): Schema<SetMultipleContextOptions<any>> =>
    z.record(z.string(), SetContextOptionsSchema());

export { SetMultipleContextOptionsSchema };
