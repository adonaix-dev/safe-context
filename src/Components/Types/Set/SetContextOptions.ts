/**
 * Options for setting a single context value.
 */
interface SetContextOptions {
    /**
     * If `true`, the context cannot be overridden later.
     *
     * @defaultValue `false`
     */
    final?: boolean;
    /**
     * If `false`, `set` will not change the value if one already
     * exists.
     *
     * @defaultValue `true`
     */
    override?: boolean;
    /**
     * If `true`, the context is set only on the current async-local
     * scope, not affecting the global scope.
     *
     * @defaultValue `false`
     */
    local?: boolean;
}

export type { SetContextOptions };
