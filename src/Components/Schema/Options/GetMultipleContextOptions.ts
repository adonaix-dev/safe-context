import z from "zod";

import type { GetMultipleContextOptions } from "~/Types/Get/GetMultipleContextOptions";
import type { Schema } from "~/Types/Schema";

import { GetContextOptionsSchema } from "./GetContextOptions";

const GetMultipleContextOptionsSchema = (): Schema<GetMultipleContextOptions<any>> =>
    z.record(z.string(), GetContextOptionsSchema());

export { GetMultipleContextOptionsSchema };
