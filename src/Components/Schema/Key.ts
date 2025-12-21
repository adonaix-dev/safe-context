import z from "zod";

import type { key } from "@adonaix/types";

import type { Schema } from "~/Types/Schema";

const KeySchema = (): Schema<key> => z.string() as any;

export { KeySchema };
