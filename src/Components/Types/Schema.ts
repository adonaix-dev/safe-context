import type { ZodType } from "zod";

type Schema<Type> = ZodType<Type, Type>;

export type { Schema };
