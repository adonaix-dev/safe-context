import type { DisposableMultipleContext } from "~/Types/Disposable/DisposableMultipleContext";
import type { WithContextChanged } from "~/Types/With/WithContextChanged";

/**
 * Represents the structure of an individual disposable context within
 * a {@link DisposableMultipleContext `DisposableMultipleContext`}.
 */
interface WithContextReturn<Type, Options> {
    /**
     * The new context value that was set for the duration of the
     * scope.
     */
    context: Type;
    /**
     * Indicates if the context value was successfully changed.
     * Returns `false` if `override: false` was used and a value
     * already existed.
     */
    changed: WithContextChanged<Options>;
    /**
     * The previous value of the context before it was temporarily
     * changed. `undefined` if it was not previously set.
     */
    previous?: Type;
}

export type { WithContextReturn };
