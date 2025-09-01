import { AsyncLocalStorage } from "node:async_hooks";

import type { AnyFunction, MaybeArray } from "@adonaix/types";

import { ContextRegistry } from "~/Registry/ContextRegistry";
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
        return (this.#asyncLocalStorage.getStore() ?? this.#registry)
            .getEntry(key)
            .set(context, options);
    }

    #setMulticontext(arg: Dictionary, options?: MulticontextSetOptions<any>): Dictionary {
        const registry = this.#asyncLocalStorage.getStore() ?? this.#registry;

        return Object.fromEntries(
            Object.entries(arg).map(([key, context]) => [
                key,
                registry.getEntry(key).set(context, options?.[key]),
            ]),
        ) as Dictionary;
    }

    set<Key extends keyof Dictionary>(
        key: Key,
        context: Dictionary[Key],
        options?: ContextSetOptions,
    ): boolean;
    set<Argument extends Dictionary>(
        arg: Argument,
        options?: MulticontextSetOptions<Argument>,
    ): MulticontextSetReturn<Argument>;
    set(
        keyOrArg: keyof Dictionary | Dictionary,
        contextOrOptions: Dictionary[keyof Dictionary] | MulticontextSetOptions<any>,
        maybeOptions?: ContextSetOptions,
    ): any {
        return typeof keyOrArg === "string"
            ? this.#setContext(keyOrArg, contextOrOptions as any, maybeOptions)
            : this.#setMulticontext(keyOrArg as any, contextOrOptions as any);
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

interface RunzyContext {
    anonymousRegistry: { anonymous(fn: AnyFunction): string };
    random: { shuffle(array: any[]): any[] };
}

const runzyContext = new SafeContext<RunzyContext>();
