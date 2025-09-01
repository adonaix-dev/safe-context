import { AsyncLocalStorage } from "node:async_hooks";

import type { AnyFunction, MaybeArray } from "@adonaix/types";

import { DisposableContext } from "~/Disposable/DisposableContext";
import { DisposableMulticontext } from "~/Disposable/DisposableMulticontext";
import { ContextRegistry } from "~/Registry/ContextRegistry";
import type { SafeContextError } from "~/Error/SafeContextError";
import type { ArgEntries } from "~/Types/Arguments/ArgEntries";
import type { ContextDictionary } from "~/Types/ContextDictionary";
import type { ContextGetOptions } from "~/Types/Options/ContextGetOptions";
import type { ContextSetOptions } from "~/Types/Options/ContextSetOptions";
import type { MulticontextGetOptions } from "~/Types/Options/MulticontextGetOptions";
import type { MulticontextSetOptions } from "~/Types/Options/MulticontextSetOptions";
import type { ContextGetReturn } from "~/Types/Return/ContextGetReturn";
import type { MulticontextGetReturn } from "~/Types/Return/MulticontextGetReturn";
import type { MulticontextSetReturn } from "~/Types/Return/MulticontextSetReturn";

declare global {
    interface ObjectConstructor {
        entries<T>(object: T): [keyof T, T[keyof T]][];
        keys<T>(object: T): (keyof T)[];
        fromEntries<T>(entries: Iterable<readonly [keyof T, T[keyof T]]>): T;
    }
}

class SafeContext<Dictionary extends ContextDictionary> {
    readonly #registry: ContextRegistry<Dictionary> = new ContextRegistry();
    readonly #asyncLocalStorage: AsyncLocalStorage<ContextRegistry<Dictionary>> =
        new AsyncLocalStorage();

    #getContext(
        key: keyof Dictionary,
        options?: ContextGetOptions<any>,
    ): ContextGetReturn<any, any> {
        return (this.#asyncLocalStorage.getStore() ?? this.#registry)
            .getEntry(key)
            .get(options);
    }

    #getMulticontext(
        contexts: (keyof Dictionary)[],
        options?: MulticontextGetOptions<any, any>,
    ): MulticontextGetReturn<any, any, any> {
        const registry = this.#asyncLocalStorage.getStore() ?? this.#registry;

        return Object.fromEntries(
            contexts.map((key) => [key, registry.getEntry(key).get(options?.[key])]),
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
    get(
        keyOrKeys: MaybeArray<keyof Dictionary>,
        maybeOptions: ContextGetOptions<any> | MulticontextGetOptions<any, any>,
    ): any {
        return typeof keyOrKeys === "string"
            ? this.#getContext(keyOrKeys, maybeOptions)
            : this.#getMulticontext(keyOrKeys as any, maybeOptions as any);
    }

    #setContext(
        key: keyof Dictionary,
        context: Dictionary[keyof Dictionary],
        options?: ContextSetOptions,
    ): boolean {
        try {
            return (this.#asyncLocalStorage.getStore() ?? this.#registry)
                .getEntry(key)
                .set(context, options);
        } catch (error: unknown) {
            throw (error as SafeContextError).formatWithKey(key as string);
        }
    }

    #setMulticontext(
        arg: Dictionary,
        options?: MulticontextSetOptions<any>,
    ): MulticontextSetReturn<Dictionary> {
        const registry = this.#asyncLocalStorage.getStore() ?? this.#registry;

        return Object.fromEntries<MulticontextSetReturn<Dictionary>>(
            Object.entries(arg).map(([key, context]) => {
                try {
                    return [key, registry.getEntry(key).set(context, options?.[key])];
                } catch (error: unknown) {
                    throw (error as SafeContextError).formatWithKey(key as string);
                }
            }),
        );
    }

    set<Key extends keyof Dictionary>(
        key: Key,
        context: Dictionary[Key],
        options?: ContextSetOptions,
    ): boolean;
    set<Arg extends Dictionary>(
        arg: Arg,
        options?: MulticontextSetOptions<Arg>,
    ): MulticontextSetReturn<Arg>;
    set(
        keyOrArg: keyof Dictionary | Dictionary,
        contextOrOptions: Dictionary[keyof Dictionary] | MulticontextSetOptions<any>,
        maybeOptions?: ContextSetOptions,
    ): any {
        return typeof keyOrArg === "string"
            ? this.#setContext(keyOrArg, contextOrOptions as any, maybeOptions)
            : this.#setMulticontext(keyOrArg as any, contextOrOptions as any);
    }

    #withContext(
        key: keyof Dictionary,
        context: Dictionary[keyof Dictionary],
        options?: ContextSetOptions,
    ): DisposableContext<Dictionary[keyof Dictionary]> {
        try {
            return new DisposableContext(
                (this.#asyncLocalStorage.getStore() ?? this.#registry).getEntry(key),
                context,
                options,
            );
        } catch (error: unknown) {
            throw (error as SafeContextError).formatWithKey(key as string);
        }
    }

    #withMulticontext(
        arg: Dictionary,
        options?: MulticontextSetOptions<any>,
    ): DisposableMulticontext<Dictionary> {
        const registry = this.#asyncLocalStorage.getStore() ?? this.#registry;

        return new DisposableMulticontext(
            arg,
            Object.fromEntries<ArgEntries<Dictionary>>(
                Object.keys(arg).map((key) => [key, registry.getEntry(key)]),
            ),
            options,
        );
    }

    with<Key extends keyof Dictionary>(
        key: Key,
        context: Dictionary[Key],
        options?: ContextSetOptions,
    ): DisposableContext<Dictionary[Key]>;
    with<Arg extends Dictionary>(
        arg: Arg,
        options?: MulticontextSetOptions<Arg>,
    ): DisposableMulticontext<Arg>;
    with(
        keyOrArg: keyof Dictionary | Dictionary,
        contextOrOptions: Dictionary[keyof Dictionary] | MulticontextSetOptions<any>,
        maybeOptions?: ContextSetOptions,
    ): any {
        return typeof keyOrArg === "string"
            ? this.#withContext(keyOrArg, contextOrOptions as any, maybeOptions)
            : this.#withMulticontext(keyOrArg as any, contextOrOptions);
    }

    concurrentlySafe<T>(callback: () => T): T {
        const storage = this.#asyncLocalStorage;

        return storage.run(
            new ContextRegistry(storage.getStore() ?? this.#registry),
            callback,
        );
    }
}

export { SafeContext };
