import type { Schema } from "~/Types/Schema";
import type { WithContextOptions } from "~/Types/With/WithContextOptions";

import { SetContextOptionsSchema } from "./SetContextOptions";

const WithContextOptionsSchema: () => Schema<WithContextOptions> =
    SetContextOptionsSchema;

export { WithContextOptionsSchema };
