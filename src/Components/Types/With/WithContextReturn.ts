import type { WithContextChanged } from "~/Types/With/WithContextChanged";

interface WithContextReturn<Type, Options> {
    context: Type;
    changed: WithContextChanged<Options>;
    previous?: Type;
}

export type { WithContextReturn };
