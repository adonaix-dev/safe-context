import { SafeContextError } from "./SafeContextError";

declare var self: typeof globalThis;
declare var window: typeof globalThis;

function getGlobal(): typeof globalThis | undefined {
    if (typeof globalThis !== "undefined") return globalThis;
    if (typeof self !== "undefined") return self;
    if (typeof window !== "undefined") return window;
    if (typeof global !== "undefined") return global;
}

/**
 * Error thrown when a required runtime feature is not available.
 */
class MissingDependencyError extends SafeContextError {
    override name = "MissingDependencyError";

    static #findDependency(dependency: string, target: any): ReferenceError | null {
        for (const part of dependency.split(".")) {
            target = target[part];

            if (typeof target === "undefined") {
                return new ReferenceError(
                    `failed to resolve reference for '${dependency}'. Please check your engine's version support or consider installing a polyfill`,
                );
            }
        }

        return null;
    }

    /**
     * Asserts that the required runtime dependencies are available in
     * the global scope.
     *
     * @param dependencies A list of global dependencies to check
     *   (e.g., `"Symbol.dispose"`, `"DisposableStack"`).
     * @throws {MissingDependencyError} If any of the specified
     *   dependencies cannot be found.
     * @throws {ReferenceError} If the global scope object cannot be
     *   resolved.
     */
    static assert(...dependencies: string[]): void {
        const globalThis = getGlobal();

        if (!globalThis) {
            throw new ReferenceError(
                `could not resolve the global scope object in the current environment`,
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
        const [dependency, error] = !hasMany ? entries[0]! : [];

        const message = hasMany
            ? `required dependencies ${entries.map(([dependency]) => `'${dependency}'`).join(", ")} could not be found in the current environment`
            : `required dependency '${dependency!}' could not be found in the current environment`;

        const cause = hasMany
            ? new AggregateError(entries.map(([, error]) => error))
            : error!;

        super(message, { cause });
    }
}

export { MissingDependencyError };
