import { AsyncLocalStorage } from "node:async_hooks";

import { DisposableContext } from "~/Disposable/DisposableContext";
import { DisposableMultipleContext } from "~/Disposable/DisposableMultipleContext";
import { ContextRegistry } from "~/Registry/ContextRegistry";
import { isGetContextArgs } from "~/Util/IsGetContextArgs";
import { isSetContextArgs } from "~/Util/IsSetContextArgs";
import type { SafeContextError } from "~/Error/SafeContextError";
import type { GetArgs } from "~/Types/Args/GetArgs";
import type { SetArgs } from "~/Types/Args/SetArgs";
import type { ConcurrentlySafeOptions } from "~/Types/ConcurrentlySafeOptions";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { GetContextOptions } from "~/Types/Get/GetContextOptions";
import type { GetContextReturn } from "~/Types/Get/GetContextReturn";
import type { GetMultipleContextOptions } from "~/Types/Get/GetMultipleContextOptions";
import type { GetMultipleContextReturn } from "~/Types/Get/GetMultipleContextReturn";
import type { SetContextOptions } from "~/Types/Set/SetContextOptions";
import type { SetContextReturn } from "~/Types/Set/SetContextReturn";
import type { SetMultipleContextOptions } from "~/Types/Set/SetMultipleContextOptions";
import type { SetMultipleContextReturn } from "~/Types/Set/SetMultipleContextReturn";
import type { WithContextOptions } from "~/Types/With/WithContextOptions";
import type { WithMultipleContextOptions } from "~/Types/With/WithMultipleContextOptions";

const { entries, fromEntries, keys } = Object;

class SafeContext<Dictionary extends ContextDictionary> {
    readonly #registry: ContextRegistry<Dictionary> = new ContextRegistry();
    readonly #asyncLocalStorage: AsyncLocalStorage<ContextRegistry<Dictionary>> =
        new AsyncLocalStorage();

    #getRegistry(): ContextRegistry<Dictionary> {
        return this.#asyncLocalStorage.getStore() ?? this.#registry;
    }

    #get(key: string, options?: GetContextOptions<any>): GetContextReturn<any, any> {
        return this.#getRegistry().getAsGlobalAsPossibleEntry(key).get(options);
    }

    #getMultiple(
        contexts: string[],
        options?: GetMultipleContextOptions<any>,
    ): GetMultipleContextReturn<any, any> {
        const registry = this.#getRegistry();

        return fromEntries(
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
        try {
            return this.#getRegistry()
                .getAsGlobalAsPossibleEntry(key)
                .set(context, options);
        } catch (error: unknown) {
            throw (error as SafeContextError).formatWithKey(key);
        }
    }

    #setMultiple(
        arg: ContextDictionary,
        options?: SetMultipleContextOptions<any>,
    ): SetMultipleContextReturn<any, any> {
        const registry = this.#getRegistry();

        return fromEntries(
            entries(arg).map(([key, context]) => {
                try {
                    return [
                        key,
                        registry
                            .getAsGlobalAsPossibleEntry(key)
                            .set(context, options?.[key]),
                    ];
                } catch (error: unknown) {
                    throw (error as SafeContextError).formatWithKey(key);
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
        try {
            return new DisposableContext(
                this.#getRegistry().getEntryWithinThisRegistry(key),
                context,
                options,
            );
        } catch (error: unknown) {
            throw (error as SafeContextError).formatWithKey(key);
        }
    }

    #withMultiple(
        arg: ContextDictionary,
        options?: SetMultipleContextOptions<any>,
    ): DisposableMultipleContext<any, any> {
        const registry = this.#getRegistry();

        return new DisposableMultipleContext(
            arg,
            fromEntries(
                keys(arg).map((key) => [key, registry.getEntryWithinThisRegistry(key)]),
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
            new ContextRegistry(this.#getRegistry(), this.#registry),
            () => {
                const registry = this.#getRegistry();
                const { contexts } = options;

                (contexts === "current" ? registry.getCurrentKeys() : contexts)?.forEach(
                    (key) => void registry.getEntryWithinThisRegistry(key),
                );

                return callback();
            },
        );
    }
}

export { SafeContext };
