import type { WithContextChanged } from "~/Types/With/WithContextChanged";

import type { WithContextOptions } from "./WithContextOptions";

interface WithContextReturn<Type, Options extends WithContextOptions> {
    context: Type;
    changed: WithContextChanged<Options>;
    previous?: Type;
}

export type { WithContextReturn };
