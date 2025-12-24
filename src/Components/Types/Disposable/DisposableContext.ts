import type { SafeContext } from "it";

import type { WithContextOptions } from "~/Types/With/WithContextOptions";
import type { WithContextReturn } from "~/Types/With/WithContextReturn";

/**
 * An object returned by {@link SafeContext.with `with()`} for a single
 * context. It is meant to be used with a `using` statement to
 * guarantee that the context is reverted after the scope ends.
 */
interface DisposableContext<Type, Options extends WithContextOptions>
    extends Disposable, WithContextReturn<Type, Options> {}

export type { DisposableContext };
