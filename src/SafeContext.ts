import { AsyncLocalStorage } from "node:async_hooks";
import { inspect } from "node:util";

import { DisposableContext } from "~/Disposable/DisposableContext";
import { DisposableMultipleContext } from "~/Disposable/DisposableMultipleContext";
import { ContextRegistry } from "~/Registry/ContextRegistry";
import { FinalOverrideError } from "~/Registry/Entry/Error/FinalOverrideError";
import { isGetContextArgs } from "~/Util/IsGetContextArgs";
import { isSetContextArgs } from "~/Util/IsSetContextArgs";
import type { GetArgs } from "~/Types/Args/GetArgs";
import type { SetArgs } from "~/Types/Args/SetArgs";
import type { ConcurrentlySafeOptions } from "~/Types/ConcurrentlySafeOptions";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { DisposableContext as IDisposableContext } from "~/Types/Disposable/DisposableContext";
import type { DisposableMultipleContext as IDisposableMultipleContext } from "~/Types/Disposable/DisposableMultipleContext";
import type { GetContextOptions } from "~/Types/Get/GetContextOptions";
import type { GetContextReturn } from "~/Types/Get/GetContextReturn";
import type { GetMultipleContextOptions } from "~/Types/Get/GetMultipleContextOptions";
import type { GetMultipleContextReturn } from "~/Types/Get/GetMultipleContextReturn";
import type { SafeContextOptions } from "~/Types/SafeContextOptions";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";
import type { SetContextReturn } from "~/Types/Set/SetContextReturn";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";
import type { SetMultipleContextReturn } from "~/Types/Set/SetMultipleContextReturn";
import type { WithContextOptions } from "~/Types/With/WithContextOptions";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";

const INSPECT: typeof inspect.custom = inspect.custom;

/**
 * A concurrency-safe context manager powered by
 * {@link AsyncLocalStorage `AsyncLocalStorage`}. It allows setting and
 * getting values that can be global or scoped to a specific
 * asynchronous execution path.
 *
 * @template Dictionary A type describing the shape of the context.
 */
class SafeContext<Dictionary extends ContextDictionary> {
    readonly #globalRegistry: ContextRegistry<Dictionary> = new ContextRegistry();
    readonly #asyncLocalStorage: AsyncLocalStorage<ContextRegistry<Dictionary>> =
        new AsyncLocalStorage();

    readonly #hideKeys: boolean | (keyof Dictionary)[] = false;

    /**
     * @param options Configuration for the new instance.
     */
    constructor(options?: SafeContextOptions<Dictionary>) {
        if (options?.hideKeys) {
            this.#hideKeys = options.hideKeys;
        }
    }

    #getRegistry(): ContextRegistry<Dictionary> {
        return this.#asyncLocalStorage.getStore() ?? this.#globalRegistry;
    }

    #get(key: string, options?: GetContextOptions<any>): GetContextReturn<any, any> {
        return this.#getRegistry().getAsGlobalAsPossibleEntry(key).get(options);
    }

    #getMultiple(
        contexts: string[],
        options?: GetMultipleContextOptions<any>,
    ): GetMultipleContextReturn<any, any> {
        const registry = this.#getRegistry();

        return Object.fromEntries(
            contexts.map((key) => [
                key,
                registry.getAsGlobalAsPossibleEntry(key).get(options?.[key]),
            ]),
        );
    }

    /**
     * Retrieves a single context value by its key.
     *
     * @param key The key of the context to retrieve.
     * @param options Options for the retrieval operation.
     *
     * @returns The context value, or `undefined` if it's not set and
     *   no {@link GetContextOptions.supply `supply()`} function is
     *   provided.
     */
    get<Key extends keyof Dictionary, Options extends GetContextOptions<Dictionary[Key]>>(
        key: Key,
        options?: Options,
    ): GetContextReturn<Dictionary[Key], Options>;

    /**
     * Retrieves multiple context values.
     *
     * @param keys An array of keys to retrieve.
     * @param options Options for the retrieval operation, applicable
     *   to each key.
     *
     * @returns An object containing the retrieved key-value pairs.
     */
    get<
        Key extends keyof Dictionary,
        Options extends GetMultipleContextOptions<Pick<Dictionary, Key>>,
    >(
        keys: Key[],
        options?: Options,
    ): GetMultipleContextReturn<Pick<Dictionary, Key>, Options>;

    get(...args: GetArgs): any {
        return isGetContextArgs(args) ? this.#get(...args) : this.#getMultiple(...args);
    }

    #set(key: string, context: any, options?: SetContextOptions): boolean {
        const registry = this.#getRegistry();
        const entry = options?.local
            ? registry.getLocalEntry(key)
            : registry.getAsGlobalAsPossibleEntry(key);

        try {
            return entry.set(context, { ...(options ?? {}), force: false });
        } catch (error: unknown) {
            throw error instanceof FinalOverrideError ? error.withKey(key) : error;
        }
    }

    #setMultiple(
        contexts: ContextDictionary,
        options?: SetMultipleContextOptions<any>,
    ): SetMultipleContextReturn<any, any> {
        const registry = this.#getRegistry();

        return Object.fromEntries(
            Object.entries(contexts).map(([key, context]) => {
                const entry = options?.[key]?.local
                    ? registry.getLocalEntry(key)
                    : registry.getAsGlobalAsPossibleEntry(key);

                try {
                    return [
                        key,
                        entry.set(context, { ...(options?.[key] ?? {}), force: false }),
                    ];
                } catch (error: unknown) {
                    throw error instanceof FinalOverrideError
                        ? error.withKey(key)
                        : error;
                }
            }),
        );
    }

    /**
     * Sets a single context value.
     *
     * @param key The key of the context to set.
     * @param context The value to set.
     * @param options Options for the set operation.
     *
     * @returns `true` if the context was successfully set, or `false`
     *   otherwise.
     * @throws {FinalOverrideError} If attempting to override a
     *   context marked as {@link SetContextOptions.final `final`}.
     */
    set<Key extends keyof Dictionary, Options extends SetContextOptions>(
        key: Key,
        context: Dictionary[Key],
        options?: Options,
    ): SetContextReturn<Options>;

    /**
     * Sets multiple context values at once.
     *
     * @param contexts An object of key-value pairs to set.
     * @param options Options for the set operation, applicable to
     *   each key.
     *
     * @returns An object containing the result of each individual set
     *   operation.
     * @throws {FinalOverrideError} If attempting to override a
     *   context marked as {@link SetContextOptions.final `final`}.
     */
    set<
        Ctxs extends Partial<Dictionary>,
        Options extends SetMultipleContextOptions<Ctxs>,
    >(contexts: Ctxs, options?: Options): SetMultipleContextReturn<Ctxs, Options>;

    set(...args: SetArgs): any {
        return isSetContextArgs(args) ? this.#set(...args) : this.#setMultiple(...args);
    }

    #with(
        key: string,
        context: any,
        options?: SetContextOptions,
    ): DisposableContext<any, any> {
        return DisposableContext.create(key, context, this.#getRegistry(), options);
    }

    #withMultiple(
        contexts: ContextDictionary,
        options?: SetMultipleContextOptions<any>,
    ): DisposableMultipleContext<any, any> {
        return DisposableMultipleContext.create(contexts, this.#getRegistry(), options);
    }

    /**
     * Temporarily sets a context value within a scope. Designed for
     * use with the `using` statement. The original value is restored
     * automatically when the scope is exited.
     *
     * @param key The key of the context to set.
     * @param context The temporary value.
     * @param options Options for the set operation.
     *
     * @returns A {@link IDisposableContext `DisposableContext`} object
     *   to be used in a `using` statement.
     * @throws {FinalOverrideError} If attempting to override a
     *   context marked as {@link SetContextOptions.final `final`}.
     * @throws {MissingDependencyError} If the `Symbol.dispose`
     *   feature is not available in the JavaScript runtime.
     */
    with<Key extends keyof Dictionary, Options extends WithContextOptions>(
        key: Key,
        context: Dictionary[Key],
        options?: Options,
    ): IDisposableContext<Dictionary[Key], Options>;

    /**
     * Temporarily sets multiple context values within a scope.
     * Designed for use with the `using` statement.
     *
     * @param contexts An object of key-value pairs to set.
     * @param options Options for the set operation, applicable to
     *   each key.
     *
     * @returns A
     *   {@link IDisposableMultipleContext `DisposableMultipleContext`}
     *   object to be used in a `using` statement.
     * @throws {FinalOverrideError} If attempting to override any
     *   context marked as {@link SetContextOptions.final `final`}.
     * @throws {MissingDependencyError} If `Symbol.dispose` or
     *   `DisposableStack` are not available in the JavaScript
     *   runtime.
     */
    with<
        Ctxs extends Partial<Dictionary>,
        Options extends WithMultipleContextOptions<Ctxs>,
    >(contexts: Ctxs, options?: Options): IDisposableMultipleContext<Ctxs, Options>;

    with(...args: SetArgs): any {
        return isSetContextArgs(args) ? this.#with(...args) : this.#withMultiple(...args);
    }

    /**
     * Executes a callback within a new, isolated asynchronous scope.
     * It guarantees that context changes made inside the callback
     * (e.g., using {@link with `with()`} or {@link set `set()`} with
     * the {@link SetContextOptions.local `local`} option) do not
     * affect the parent scope or any other concurrently running
     * operations.
     *
     * @param callback The function to execute within the isolated
     *   scope.
     * @param options Options to control how the new scope inherits
     *   contexts from its parent.
     *
     * @returns The value returned by the callback function.
     */
    concurrentlySafe<T>(
        callback: () => T,
        options: ConcurrentlySafeOptions<Dictionary> = {},
    ): T {
        return this.#asyncLocalStorage.run(
            new ContextRegistry(this.#getRegistry(), this.#globalRegistry),
            () => {
                const registry = this.#getRegistry();
                const { contexts } = options;

                (contexts === "current" ? registry.getCurrentKeys() : contexts)?.forEach(
                    (key) => void registry.getLocalEntry(key),
                );

                return callback();
            },
        );
    }

    /**
     * Custom inspection method for Node.js's `util.inspect`.
     *
     * @internal
     */
    [INSPECT](): string {
        const currentKeys = this.#getRegistry().getCurrentKeys();

        const hideKeys = this.#hideKeys;
        const keysToHide =
            hideKeys && !Array.isArray(hideKeys) ? currentKeys : new Set(hideKeys || []);

        const keys = [...currentKeys].filter((key) => !keysToHide.has(key)) as string[];

        return `SafeContext { ${keys.length ? keys.map((key) => `'${key}'`).join(", ") : "..."} }`;
    }
}

export { SafeContext };
