import z from "zod";

import { KeySchema } from "~/Schema/Key";
import type { Schema } from "~/Types/Schema";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";

import { SetContextOptionsSchema } from "./SetContextOptions";

const SetMultipleContextOptionsSchema = (): Schema<SetMultipleContextOptions<any>> =>
    z.record(KeySchema(), SetContextOptionsSchema());

export { SetMultipleContextOptionsSchema };
