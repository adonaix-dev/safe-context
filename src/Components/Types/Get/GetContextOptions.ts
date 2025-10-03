/**
 * Options for retrieving a single context value.
 *
 * @template Type The type of the context value.
 */
interface GetContextOptions<Type> {
    /**
     * A function that supplies a default value if the context is not
     * already set. The supplied value will be set and then returned.
     */
    supply?(): Type;
}

export type { GetContextOptions };
