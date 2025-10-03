import type { WithContextOptions } from "~/Types/With/WithContextOptions";
import type { WithContextReturn } from "~/Types/With/WithContextReturn";

interface DisposableContext<Type, Options extends WithContextOptions>
    extends Disposable,
        WithContextReturn<Type, Options> {}

export type { DisposableContext };
