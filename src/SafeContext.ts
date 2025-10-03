import { AsyncLocalStorage } from "node:async_hooks";
import { inspect } from "node:util";

import { DisposableContext } from "~/Disposable/DisposableContext";
import { DisposableMultipleContext } from "~/Disposable/DisposableMultipleContext";
import { MissingDependencyError } from "~/Error/MissingDependencyError";
import { ContextRegistry } from "~/Registry/ContextRegistry";
import { FinalOverrideError } from "~/Registry/Entry/Error/FinalOverrideError";
import { isGetContextArgs } from "~/Util/IsGetContextArgs";
import { isSetContextArgs } from "~/Util/IsSetContextArgs";
import type { GetArgs } from "~/Types/Args/GetArgs";
import type { SetArgs } from "~/Types/Args/SetArgs";
import type { ConcurrentlySafeOptions } from "~/Types/ConcurrentlySafeOptions";
import type { ContextDictionary } from "~/Types/ContextDictionary";
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

class SafeContext<Dictionary extends ContextDictionary> {
    readonly #globalRegistry: ContextRegistry<Dictionary> = new ContextRegistry();
    readonly #asyncLocalStorage: AsyncLocalStorage<ContextRegistry<Dictionary>> =
        new AsyncLocalStorage();

    readonly #hideKeys: boolean | (keyof Dictionary)[] = false;

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

    get<Key extends keyof Dictionary, Options extends GetContextOptions<Dictionary[Key]>>(
        key: Key,
        options?: Options,
    ): GetContextReturn<Dictionary[Key], Options>;
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
        arg: ContextDictionary,
        options?: SetMultipleContextOptions<any>,
    ): SetMultipleContextReturn<any, any> {
        const registry = this.#getRegistry();

        return Object.fromEntries(
            Object.entries(arg).map(([key, context]) => {
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

    set<Key extends keyof Dictionary, Options extends SetContextOptions>(
        key: Key,
        context: Dictionary[Key],
        options?: Options,
    ): SetContextReturn<Options>;
    set<Arg extends Partial<Dictionary>, Options extends SetMultipleContextOptions<Arg>>(
        arg: Arg,
        options?: Options,
    ): SetMultipleContextReturn<Arg, Options>;
    set(...args: SetArgs): any {
        return isSetContextArgs(args) ? this.#set(...args) : this.#setMultiple(...args);
    }

    #with(
        key: string,
        context: any,
        options?: SetContextOptions,
    ): DisposableContext<any, any> {
        MissingDependencyError.assert("Symbol.dispose");

        try {
            return new DisposableContext(
                this.#getRegistry().getLocalEntry(key),
                context,
                { ...(options ?? {}), force: false },
            );
        } catch (error: unknown) {
            throw error instanceof FinalOverrideError ? error.withKey(key) : error;
        }
    }

    #withMultiple(
        arg: ContextDictionary,
        options?: SetMultipleContextOptions<any>,
    ): DisposableMultipleContext<any, any> {
        MissingDependencyError.assert("Symbol.dispose", "DisposableStack");

        const registry = this.#getRegistry();

        return new DisposableMultipleContext(
            arg,
            Object.fromEntries(
                Object.keys(arg).map((key) => [key, registry.getLocalEntry(key)]),
            ),
            options,
        );
    }

    with<Key extends keyof Dictionary, Options extends WithContextOptions>(
        key: Key,
        context: Dictionary[Key],
        options?: Options,
    ): DisposableContext<Dictionary[Key], Options>;
    with<
        Arg extends Partial<Dictionary>,
        Options extends WithMultipleContextOptions<Arg>,
    >(arg: Arg, options?: Options): DisposableMultipleContext<Arg, Options>;
    with(...args: SetArgs): any {
        return isSetContextArgs(args) ? this.#with(...args) : this.#withMultiple(...args);
    }

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
