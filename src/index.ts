export type { ContextDictionary } from "~/Types/ContextDictionary";

export type { GetContextOptions } from "~/Types/Get/GetContextOptions";
export type { GetMultipleContextOptions } from "~/Types/Get/GetMultipleContextOptions";
export type { GetMultipleContextReturn } from "~/Types/Get/GetMultipleContextReturn";

export type { SetContextOptions } from "~/Types/Set/SetContextOptions";
export type { SetContextReturn } from "~/Types/Set/SetContextReturn";
export type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";
export type { SetMultipleContextReturn } from "~/Types/Set/SetMultipleContextReturn";

export type { WithContextChanged } from "~/Types/With/WithContextChanged";
export type { WithContextOptions } from "~/Types/With/WithContextOptions";
export type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";
export type { WithMultipleContextScope } from "~/Types/With/WithMultipleContextScope";

export type { DisposableContext } from "~/Types/Disposable/DisposableContext";
export type { DisposableMultipleContext } from "~/Types/Disposable/DisposableMultipleContext";

export type { ContextSnapshot } from "~/Types/ContextSnapshot";

export { ContextNotFoundError } from "~/Error/ContextNotFoundError";
export { MissingDependencyError } from "~/Error/MissingDependencyError";
export { SafeContextError } from "~/Error/SafeContextError";

export { FinalContextMutationType } from "~/Registry/Entry/Error/FinalContextMutationType";
export { FinalContextMutationError } from "~/Registry/Entry/Error/FinalContextMutationError";

export { ArgumentsError, OverloadsError } from "zod-guardians";

export { SafeContext } from "./SafeContext";
