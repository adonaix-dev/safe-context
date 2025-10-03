import type { DisposableContext } from "~/Types/Disposable/DisposableContext";
import type { SetContextReturn } from "~/Types/Set/SetContextReturn";

/**
 * Represents the return value of the
 * {@link DisposableContext.changed `changed`} property in a
 * {@link DisposableContext `DisposableContext`}.
 *
 * @see {@link SetContextReturn `SetContextReturn`}
 */
type WithContextChanged<Options> = SetContextReturn<Options>;

export type { WithContextChanged };
