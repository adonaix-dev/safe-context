import { AsyncLocalStorage } from "node:async_hooks";
import { inspect } from "node:util";

import z from "zod";
import { ZodFunction, ZodOverloadedFunction } from "zod-guardians";
import type { ArgumentsError, OverloadsError } from "zod-guardians";

import { DisposableContext } from "~/Disposable/DisposableContext";
import { DisposableMultipleContext } from "~/Disposable/DisposableMultipleContext";
import { ContextNotFoundError } from "~/Error/ContextNotFoundError";
import { ContextRegistry } from "~/Registry/ContextRegistry";
import { FinalOverrideError } from "~/Registry/Entry/Error/FinalOverrideError";
import { ContextsSchema } from "~/Schema/Contexts";
import { KeySchema } from "~/Schema/Key";
import { ConcurrentlySafeOptionsSchema } from "~/Schema/Options/ConcurrentlySafeOptions";
import { GetContextOptionsSchema } from "~/Schema/Options/GetContextOptions";
import { GetMultipleContextOptionsSchema } from "~/Schema/Options/GetMultipleContextOptions";
import { SetContextOptionsSchema } from "~/Schema/Options/SetContextOptions";
import { SetMultipleContextOptionsSchema } from "~/Schema/Options/SetMultipleContextOptions";
import { WithContextOptionsSchema } from "~/Schema/Options/WithContextOptions";
import { WithMultipleContextOptionsSchema } from "~/Schema/Options/WithMultipleContextOptions";
import type { ConcurrentlySafeOptions } from "~/Types/ConcurrentlySafeOptions";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { ContextSnapshot } from "~/Types/ContextSnapshot";
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

    static #Has = ZodFunction.create(
        [KeySchema()],
        function (this: SafeContext<any>, key) {
            return this.#getRegistry().has(key);
        },
    );

    static #Get = ZodOverloadedFunction.create<SafeContext<any>>()
        .overload(
            [KeySchema(), GetContextOptionsSchema().optional()],
            function (key, options) {
                return this.#getRegistry().getAsGlobalAsPossibleEntry(key).get(options);
            },
        )
        .overload(
            [z.array(KeySchema()), GetMultipleContextOptionsSchema().optional()],
            function (contexts, options) {
                const registry = this.#getRegistry();

                return Object.fromEntries(
                    contexts.map((key) => [
                        key,
                        registry
                            .getAsGlobalAsPossibleEntry(key)
                            .get(options?.[key as any]),
                    ]),
                );
            },
        );

    static #Require = ZodFunction.create(
        [KeySchema(), z.string().optional()],
        function (this: SafeContext<any>, key, message) {
            if (!this.#getRegistry().has(key)) {
                throw new ContextNotFoundError(key as string, message);
            }

            return this.get(key)!;
        },
    );

    static #Set = ZodOverloadedFunction.create<SafeContext<any>>()
        .overload(
            [KeySchema(), z.any(), SetContextOptionsSchema().optional()],
            function (key, context, options) {
                const registry = this.#getRegistry();
                const entry = options?.local
                    ? registry.getLocalEntry(key)
                    : registry.getAsGlobalAsPossibleEntry(key);

                try {
                    return entry.set(context, { ...(options ?? {}), force: false });
                } catch (error: unknown) {
                    throw error instanceof FinalOverrideError
                        ? error.withKey(key as string)
                        : error;
                }
            },
        )
        .overload(
            [ContextsSchema(), SetMultipleContextOptionsSchema().optional()],
            function (contexts, options) {
                const registry = this.#getRegistry();

                return Object.fromEntries(
                    Object.entries(contexts).map(([key, context]) => {
                        const entry = options?.[key]?.local
                            ? registry.getLocalEntry(key)
                            : registry.getAsGlobalAsPossibleEntry(key);

                        try {
                            return [
                                key,
                                entry.set(context, {
                                    ...(options?.[key] ?? {}),
                                    force: false,
                                }),
                            ];
                        } catch (error: unknown) {
                            throw error instanceof FinalOverrideError
                                ? error.withKey(key)
                                : error;
                        }
                    }),
                );
            },
        );

    static #With = ZodOverloadedFunction.create<SafeContext<any>>()
        .overload(
            [KeySchema(), z.any(), WithContextOptionsSchema().optional()],
            function (key, context, options) {
                return DisposableContext.create(
                    key,
                    context,
                    this.#getRegistry(),
                    options,
                );
            },
        )
        .overload(
            [ContextsSchema(), WithMultipleContextOptionsSchema().optional()],
            function (contexts, options) {
                return DisposableMultipleContext.create(
                    contexts,
                    this.#getRegistry(),
                    options,
                );
            },
        );

    static #ConcurrentlySafe = ZodFunction.create(
        [z.function(), ConcurrentlySafeOptionsSchema()],
        function (this: SafeContext<any>, callback, options) {
            return this.#asyncLocalStorage.run(
                new ContextRegistry(this.#getRegistry(), this.#globalRegistry),
                () => {
                    const registry = this.#getRegistry();
                    const { contexts } = options ?? {};

                    (contexts === "current"
                        ? registry.getCurrentKeys()
                        : contexts
                    )?.forEach((key) => void registry.getLocalEntry(key));

                    return callback();
                },
            );
        },
    );

    /**
     * Checks if a context value is currently set without retrieving
     * it.
     *
     * @param key The key to check.
     * @throws {ArgumentsError} If {@link key `key`} is not a string.
     */
    has(key: keyof Dictionary): boolean {
        return SafeContext.#Has.apply([key], this);
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
     * @throws {OverloadsError} If no overload matches the provided
     *   arguments.
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
     * @throws {OverloadsError} If no overload matches the provided
     *   arguments.
     */
    get<
        Key extends keyof Dictionary,
        Options extends GetMultipleContextOptions<Pick<Dictionary, Key>>,
    >(
        keys: Key[],
        options?: Options,
    ): GetMultipleContextReturn<Pick<Dictionary, Key>, Options>;

    get(...args: any): any {
        return SafeContext.#Get.apply(args, this);
    }

    /**
     * Retrieves a context value, throwing an error if it is not set.
     *
     * @param key The key of the context to retrieve.
     * @param message A custom error message to be thrown if the
     *   context is not found. If not provided, a default message
     *   including the context key will be used.
     *
     * @returns The context value.
     * @throws {ContextNotFoundError} If the context is not found.
     * @throws {ArgumentsError} If {@link key `key`} is not a string or
     *   if {@link message `message`} is passed but it's not a string.
     */
    require<Key extends keyof Dictionary>(key: Key, message?: string): Dictionary[Key] {
        return SafeContext.#Require.apply([key, message], this);
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
     * @throws {OverloadsError} If no overload matches the provided
     *   arguments.
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
     * @throws {OverloadsError} If no overload matches the provided
     *   arguments.
     */
    set<
        Ctxs extends Partial<Dictionary>,
        Options extends SetMultipleContextOptions<Ctxs>,
    >(contexts: Ctxs, options?: Options): SetMultipleContextReturn<Ctxs, Options>;

    set(...args: any): any {
        return SafeContext.#Set.apply(args, this);
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
     * @throws {MissingDependencyError} If the
     *   {@link Symbol.dispose `Symbol.dispose`} feature is not
     *   available in the JavaScript runtime.
     * @throws {OverloadsError} If no overload matches the provided
     *   arguments.
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
     * @throws {MissingDependencyError} If the
     *   {@link Symbol.dispose `Symbol.dispose`} or the
     *   {@link DisposableStack `DisposableStack`} features are not
     *   available in the JavaScript runtime.
     * @throws {OverloadsError} If no overload matches the provided
     *   arguments.
     */
    with<
        Ctxs extends Partial<Dictionary>,
        Options extends WithMultipleContextOptions<Ctxs>,
    >(contexts: Ctxs, options?: Options): IDisposableMultipleContext<Ctxs, Options>;

    with(...args: any): any {
        return SafeContext.#With.apply(args, this);
    }

    /**
     * Creates a plain object containing a snapshot of all currently
     * set contexts. Keys marked as hidden in the constructor will be
     * excluded.
     *
     * @returns A partial dictionary with the current values.
     */
    snapshot(): ContextSnapshot<Dictionary> {
        const registry = this.#getRegistry();
        const currentKeys = registry.getCurrentKeys();
        const hideKeys = this.#hideKeys;

        if (hideKeys === true) {
            return {};
        }

        const keysToHide =
            hideKeys && !Array.isArray(hideKeys) ? currentKeys : new Set(hideKeys || []);

        return Object.fromEntries(
            [...currentKeys]
                .filter((key) => !keysToHide.has(key))
                .map((key) => [key, registry.getAsGlobalAsPossibleEntry(key).get()]),
        ) as any;
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
     * @throws {ArgumentsError} If {@link callback `callback`} is not a
     *   function or if {@link options `options`} properties types are
     *   incorrect.
     */
    concurrentlySafe<T>(
        callback: () => T,
        options: ConcurrentlySafeOptions<Dictionary> = {},
    ): T {
        return SafeContext.#ConcurrentlySafe.apply([callback, options], this) as T;
    }

    /**
     * Clears all non-final entries from the current context registry.
     */
    clear(): void {
        this.#getRegistry().clear();
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
