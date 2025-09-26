import { SafeContextError } from "./SafeContextError";

declare var self: typeof globalThis;
declare var window: typeof globalThis;

function getGlobalThis(): typeof globalThis | undefined {
    try {
        return globalThis;
    } catch {}

    try {
        return self;
    } catch {}

    try {
        return window;
    } catch {}

    try {
        return global;
    } catch {}
}

class MissingDependencyError extends SafeContextError {
    override name = "MissingDependencyError";

    static #findDependency(
        dependency: string,
        target: typeof globalThis
    ): ReferenceError | null {
        const dependencyParts = dependency.split(".");

        for (const part of dependencyParts) {
            target = (target as any)[part];

            if (typeof target === "undefined") {
                return new ReferenceError(
                    `failed to resolve reference for '${dependency}'. Please check your engine's version support or consider installing a polyfill`,
                );
            }
        }

        return null;
    }

    static assert(...dependencies: string[]): void {
        const globalThis = getGlobalThis();

        if (!globalThis) {
            throw new ReferenceError(
                `could not resolve the global scope object in the current environment.`,
            );
        }

        const entries = dependencies
            .map((dependency) => [
                dependency,
                this.#findDependency(dependency, globalThis),
            ])
            .filter((entry): entry is [string, ReferenceError] => entry[1] !== null);

        if (entries.length) {
            throw new MissingDependencyError(entries);
        }
    }

    private constructor(entries: [string, ReferenceError][]) {
        const hasMany = entries.length > 1;
        const [dependency, error] = !hasMany && entries[0] || [];

        const message = hasMany
            ? `required dependencies ${entries.map(([dependency]) => `'${dependency}'`).join(", ")} could not be found ìn the current environment`
            : `required dependency '${dependency!}' could not be found ìn the current environment`;

        const cause = hasMany
            ? new AggregateError(entries.map(([, error]) => error))
            : error!;

        super(message, { cause });
    }
}

export { MissingDependencyError };
