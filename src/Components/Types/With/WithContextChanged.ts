import type { SetContextReturn } from "~/Types/Set/SetContextReturn";

import type { WithContextOptions } from "./WithContextOptions";

type WithContextChanged<Options extends WithContextOptions> = SetContextReturn<Options>;

export type { WithContextChanged };
