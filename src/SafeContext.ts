import { AsyncLocalStorage } from "node:async_hooks";

import { DisposableContext } from "~/Disposable/DisposableContext";
import { DisposableMulticontext } from "~/Disposable/DisposableMulticontext";
import { ContextRegistry } from "~/Registry/ContextRegistry";
import { isGetContextArgs } from "~/Util/IsGetContextArgs";
import { isSetContextArgs } from "~/Util/IsSetContextArgs";
import type { SafeContextError } from "~/Error/SafeContextError";
import type { GetArgs } from "~/Types/Args/GetArgs";
import type { SetArgs } from "~/Types/Args/SetArgs";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { ConcurrentlySafeOptions } from "~/Types/Options/ConcurrentlySafeOptions";
import type { ContextGetOptions } from "~/Types/Options/ContextGetOptions";
import type { ContextSetOptions } from "~/Types/Options/ContextSetOptions";
import type { MulticontextGetOptions } from "~/Types/Options/MulticontextGetOptions";
import type { MulticontextSetOptions } from "~/Types/Options/MulticontextSetOptions";
import type { ContextGetReturn } from "~/Types/Return/ContextGetReturn";
import type { MulticontextGetReturn } from "~/Types/Return/MulticontextGetReturn";
import type { MulticontextSetReturn } from "~/Types/Return/MulticontextSetReturn";

const { entries, fromEntries, keys } = Object;

class SafeContext<Dictionary extends ContextDictionary> {
    readonly #registry: ContextRegistry<Dictionary> = new ContextRegistry();
    readonly #asyncLocalStorage: AsyncLocalStorage<ContextRegistry<Dictionary>> =
        new AsyncLocalStorage();

    #getRegistry(): ContextRegistry<Dictionary> {
        return this.#asyncLocalStorage.getStore() ?? this.#registry;
    }

    #get(key: string, options?: ContextGetOptions<any>): ContextGetReturn<any, any> {
        return this.#getRegistry().getAsGlobalAsPossibleEntry(key).get(options);
    }

    #getMultiple(
        contexts: string[],
        options?: MulticontextGetOptions<any, any>,
    ): MulticontextGetReturn<any, any, any> {
        const registry = this.#getRegistry();

        return fromEntries(
            contexts.map((key) => [
                key,
                registry.getAsGlobalAsPossibleEntry(key).get(options?.[key]),
            ]),
        );
    }

    get<Key extends keyof Dictionary, Options extends ContextGetOptions<Dictionary[Key]>>(
        key: Key,
        options?: Options,
    ): ContextGetReturn<Dictionary[Key], Options>;
    get<
        Key extends keyof Dictionary,
        Options extends MulticontextGetOptions<Dictionary, Key>,
    >(keys: Key[], options?: Options): MulticontextGetReturn<Dictionary, Key, Options>;
    get(...args: GetArgs): any {
        return isGetContextArgs(args) ? this.#get(...args) : this.#getMultiple(...args);
    }

    #set(key: string, context: any, options?: ContextSetOptions): boolean {
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
        options?: MulticontextSetOptions<any>,
    ): MulticontextSetReturn<any> {
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

    set<Key extends keyof Dictionary>(
        key: Key,
        context: Dictionary[Key],
        options?: ContextSetOptions,
    ): boolean;
    set<Arg extends Partial<Dictionary>>(
        arg: Arg,
        options?: MulticontextSetOptions<Arg>,
    ): MulticontextSetReturn<Arg>;
    set(...args: SetArgs): any {
        return isSetContextArgs(args) ? this.#set(...args) : this.#setMultiple(...args);
    }

    #with(
        key: string,
        context: any,
        options?: ContextSetOptions,
    ): DisposableContext<any> {
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
        options?: MulticontextSetOptions<any>,
    ): DisposableMulticontext<any> {
        const registry = this.#getRegistry();

        return new DisposableMulticontext(
            arg,
            fromEntries(
                keys(arg).map((key) => [key, registry.getEntryWithinThisRegistry(key)]),
            ),
            options,
        );
    }

    with<Key extends keyof Dictionary>(
        key: Key,
        context: Dictionary[Key],
        options?: ContextSetOptions,
    ): DisposableContext<Dictionary[Key]>;
    with<Arg extends Partial<Dictionary>>(
        arg: Arg,
        options?: MulticontextSetOptions<Arg>,
    ): DisposableMulticontext<Arg>;
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

                const keys = contexts === "all" ? registry.getAllKeys() : contexts;
                keys?.forEach((key) => {
                    void registry.getEntryWithinThisRegistry(key);
                });

                return callback();
            },
        );
    }
}

export { SafeContext };
