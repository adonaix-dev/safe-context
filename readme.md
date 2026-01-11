# Safe-Context

> Tame race conditions in Node.js! A (almost) zero-dependency, type-safe context manager for concurrent and synchronous state management.

---

[![NPM version](https://img.shields.io/npm/v/safe-context.svg?logo=npm&logoColor=red&color=red&label=NPM)](https://www.npmjs.com/package/safe-context)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg?logo=github)](https://opensource.org/licenses/MIT)

## Motivation

In JavaScript, there are several challenges when sharing values across multiple functions or implementations.

One of them is the difficulty in deciding how to share values: should you pass them as parameters every time a child function needs them, or create a global variable? But then, where do you put the variable? How do you control its access or its mutability?

Another issue is that when sharing variables across multiple asynchronous tasks, the behavior is often unpredictable, causing frequent problems like race conditions when working with parallel tasks.

The `safe-context` package solves this in a very elegant way! It provides a way to centralize your deeply shared values, control their access and mutability, and safely share them across parallel tasks, automatically handling potential race conditions. Best of all, everything is fully type-safe, featuring interactive types for your method calls.

## Installation

```bash
# npm
npm install safe-context

# bun
bun add safe-context

# yarn
yarn add safe-context

# pnpm
pnpm add safe-context
```

## Reference Documentation

### `SafeContext<Dictionary>`

A type-safe, concurrency-aware context manager powered by Node.js's `AsyncLocalStorage`.

It manages execution context through a hierarchical registry system, allowing values to be stored either globally or scoped to specific asynchronous execution paths. It prevents illegal mutations of immutable (final) contexts.

- **Constructor:** `private constructor()`

#### Static Methods

- **`create<Dictionary>(options?)`**

    Creates a new [`SafeContext`](/readme#safecontextdictionary) instance.

    | Parameter          | Type                           | Description                                                                                                                                                                                                                  |
    | ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `options`          | `SafeContextOptions`           | _(Optional)_ Configuration for the new instance.                                                                                                                                                                             |
    | `options.hideKeys` | `true \| (keyof Dictionary)[]` | _(Optional)_ Hides specified keys from being shown when the instance is inspected (e.g., via `console.log`) or captured in the snapshot. If `true`, all keys are hidden; or if an array of keys, only those keys are hidden. |

    **Returns:** [`SafeContext<Dictionary>`](/readme#safecontextdictionary)

    **Throws:**
    - [`ArgumentsError`](/readme#argumentserror): If `options.hideKeys` is not `true` or of type `string[]`.

#### Instance Methods

- **`has(key)`**

    Checks if a context value is currently set without retrieving it.

    | Parameter | Type               | Description       |
    | --------- | ------------------ | ----------------- |
    | `key`     | `keyof Dictionary` | The key to check. |

    **Returns:** `true` if the key exists in the registry, `false` otherwise.

    **Throws:**
    - [`ArgumentsError`](/readme#argumentserror): If `key` is not a string.

- **`get(key, options?)`**

    Retrieves a single context value by its key.

    | Parameter        | Type                | Description                                                                                                                                |
    | ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
    | `key`            | `keyof Dictionary`  | The key of the context to retrieve.                                                                                                        |
    | `options`        | `GetContextOptions` | _(Optional)_ Options for the retrieval operation.                                                                                          |
    | `options.supply` | `() => Type`        | _(Optional)_ A function that supplies a default value if the context is not already set. The supplied value will be set and then returned. |

    **Returns:** The context value, or `undefined` if it's not set and no `options.supply` function is provided.

    **Throws:**
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`get(keys, options?)`**

    Retrieves multiple context values.

    | Parameter             | Type                        | Description                                                                                                                                |
    | --------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
    | `keys`                | `(keyof Dictionary)[]`      | An array of keys to retrieve.                                                                                                              |
    | `options`             | `GetMultipleContextOptions` | _(Optional)_ Options for the retrieval operation, applicable to each key.                                                                  |
    | `options[key].supply` | `() => Type`                | _(Optional)_ A function that supplies a default value if the context is not already set. The supplied value will be set and then returned. |

    **Returns:** An object containing the retrieved key-value pairs.

    **Throws:**
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`require(key)`**

    Retrieves a context value, throwing an error if it is not set.

    | Parameter | Type               | Description                                                                                                                                              |
    | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `key`     | `keyof Dictionary` | The key of the context to retrieve.                                                                                                                      |
    | `message` | `string`           | _(Optional)_ A custom error message to be thrown if the context is not found. If not provided, a default message including the context key will be used. |

    **Returns:** The context value.

    **Throws:**
    - [`ContextNotFoundError`](/readme#contextnotfounderror): If the context is not found.
    - [`ArgumentsError`](/readme#argumentserror): If `key` is not a string or if `message` is passed but it's not a string.

- **`set(key, context, options?)`**

    Sets a single context value.

    | Parameter          | Type                           | Default Value | Description                                                                                                       |
    | ------------------ | ------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------- |
    | `key`              | `keyof Dictionary`             |               | The key of the context to set.                                                                                    |
    | `context`          | `Dictionary[keyof Dictionary]` |               | The value to set.                                                                                                 |
    | `options`          | `SetContextOptions`            |               | _(Optional)_ Options for the set operation.                                                                       |
    | `options.final`    | `boolean`                      | `false`       | _(Optional)_ If `true`, the context cannot be overridden later.                                                   |
    | `options.override` | `boolean`                      | `true`        | _(Optional)_ If `false`, `set` will not change the value if one already exists.                                   |
    | `options.local`    | `boolean`                      | `false`       | _(Optional)_ If `true`, the context is set only on the current async-local scope, not affecting the global scope. |

    **Returns:** `true` if the context was successfully set, or `false` otherwise.

    **Throws:**
    - [`FinalContextMutationError`](/readme#finalcontextmutationerror): If attempting to override a context marked as "final".
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`set(contexts, options?)`**

    Sets multiple context values at once.

    | Parameter               | Type                        | Description                                                                       |
    | ----------------------- | --------------------------- | --------------------------------------------------------------------------------- |
    | `contexts`              | `Partial<Dictionary>`       | An object of key-value pairs to set.                                              |
    | `options`               | `SetMultipleContextOptions` | _(Optional)_ Options for the set operation, applicable to each key.               |
    | `options[key].final`    | `boolean`                   | _(Optional)_ If `true`, the context cannot be overridden later.                   |
    | `options[key].override` | `boolean`                   | _(Optional)_ If `false`, `set` will not change the value if one already exists.   |
    | `options[key].local`    | `boolean`                   | _(Optional)_ If `true`, the context is set only on the current async-local scope. |

    **Returns:** An object containing the result of each individual set operation.

    **Throws:**
    - [`FinalContextMutationError`](/readme#finalcontextmutationerror): If attempting to override a context marked as "final".
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`with(key, context, options?)`**

    Temporarily sets a context value within a scope. Designed for use with the `using` statement. The original value is restored automatically when the scope is exited.

    | Parameter          | Type                           | Default Value | Description                                                                                                 |
    | ------------------ | ------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------- |
    | `key`              | `keyof Dictionary`             |               | The key of the context to set.                                                                              |
    | `context`          | `Dictionary[keyof Dictionary]` |               | The temporary value.                                                                                        |
    | `options`          | `WithContextOptions`           |               | _(Optional)_ Options for the set operation.                                                                 |
    | `options.final`    | `boolean`                      | `false`       | _(Optional)_ If `true`, the context cannot be overridden later.                                             |
    | `options.override` | `boolean`                      | `true`        | _(Optional)_ If `false`, the value will not be changed if one already exists.                               |
    | `options.local`    | `boolean`                      | `true`        | _(Optional)_ If `false`, the context is set on the global scope, not only on the current async-local scope. |

    **Returns:** A `DisposableContext` object to be used in a `using` statement.

    **Throws:**
    - [`FinalContextMutationError`](/readme#finalcontextmutationerror): If attempting to override a context marked as "final".
    - [`MissingDependencyError`](/readme#missingdependencyerror): If the `Symbol.dispose` feature is not available in the runtime.
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`with(contexts, options?)`**

    Temporarily sets multiple context values within a scope. Designed for use with the `using` statement.

    | Parameter               | Type                         | Description                                                                                                 |
    | ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
    | `contexts`              | `Partial<Dictionary>`        | An object of key-value pairs to set.                                                                        |
    | `options`               | `WithMultipleContextOptions` | _(Optional)_ Options for the set operation, applicable to each key.                                         |
    | `options[key].final`    | `boolean`                    | _(Optional)_ If `true`, the context cannot be overridden later.                                             |
    | `options[key].override` | `boolean`                    | _(Optional)_ If `false`, `set` will not change the value if one already exists.                             |
    | `options[key].local`    | `boolean`                    | _(Optional)_ If `false`, the context is set on the global scope, not only on the current async-local scope. |

    **Returns:** A `DisposableMultipleContext` object to be used in a `using` statement.

    **Throws:**
    - [`FinalContextMutationError`](/readme#finalcontextmutationerror): If attempting to override any context marked as "final".
    - [`MissingDependencyError`](/readme#missingdependencyerror): If the `Symbol.dispose` or the `DisposableStack` features are not available in the runtime.
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`snapshot()`**

    Creates a plain object containing a snapshot of all currently set contexts. Keys marked as hidden in the constructor will be excluded.

    **Returns:** A partial dictionary with the current values.

- **`concurrentlySafe(callback, options?)`**

    Executes a callback within a new, isolated asynchronous scope. It guarantees that context changes made inside the callback (using `local: true`) do not affect the parent scope or other operations.

    | Parameter          | Type                                | Description                                                                                    |
    | ------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
    | `callback`         | `() => T`                           | The function to execute within the isolated scope.                                             |
    | `options`          | `ConcurrentlySafeOptions`           | _(Optional)_ Options to control scope inheritance.                                             |
    | `options.contexts` | `(keyof Dictionary)[] \| "current"` | _(Optional)_ keys to copy to the new scope, or `"current"` to copy all currently set contexts. |

    **Returns:** The value returned by the `callback` function.

    **Throws:**
    - [`ArgumentsError`](/readme#argumentserror): If `callback` is not a function or if `options` properties types are incorrect.

- **`clear()`**

    Clears all non-final entries from the current local context registry.

    **Returns:** `void`

- **`clear(key)`**

    Clears only one specified key from the current local context registry.

    | Parameter | Type               | Description       |
    | --------- | ------------------ | ----------------- |
    | `key`     | `keyof Dictionary` | The key to clear. |

    **Returns:** `void`

    **Throws:**
    - [`FinalContextMutationError`](/readme#finalcontextmutationerror): If attempting to clear a context marked as "final".
    - [`OverloadsError`](/readme#overloadserror): If no overload matches the provided arguments.

- **`clear(keys)`**

    Clears one or more specified keys from the current local context registry.

    | Parameter | Type                   | Description                 |
    | --------- | ---------------------- | --------------------------- |
    | `keys`    | `(keyof Dictionary)[]` | The array of keys to clear. |

    **Returns:** `void`

    **Throws:**
    - [`FinalContextMutationError`](/readme#finalcontextmutationerror): If attempting to clear a context marked as "final".

### `DisposableContext<Type, Options>`

An object returned by `with()` for a single context. It is meant to be used with a `using` statement to guarantee that the context is reverted after the scope ends.

- **Extends:** `Disposable`

#### Properties

| Property   | Type                | Description                                                                                                                  |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `context`  | `Type`              | The new context value that was set for the duration of the scope.                                                            |
| `changed`  | `boolean`           | Indicates if the context value was successfully changed. Returns `false` if `override` was used and a value already existed. |
| `previous` | `Type \| undefined` | The previous value of the context before it was temporarily changed. `undefined` if it was not previously set.               |

### `DisposableMultipleContext<Dictionary, Options>`

An object returned by `with()` for multiple contexts. It is meant to be used with a `using` statement.

- **Extends:** `Disposable`

#### Properties

| Property | Type                                            | Description                                                                                                                                            |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scope`  | `WithMultipleContextScope<Dictionary, Options>` | An object containing the disposable details (a [`DisposableContext`](/readme#disposablecontexttype-options) object) for each context key that was set. |

### `SafeContextError`

Base error class for all errors thrown by `safe-context` package.

### `ContextNotFoundError`

Error thrown when a required context is accessed via `require()` but has not been set.

- **Extends:** `SafeContextError`

- **Constructor:** `constructor(key, message?)`

    | Parameter | Type     | Description                                                 |
    | --------- | -------- | ----------------------------------------------------------- |
    | `key`     | `string` | The key of the missing context.                             |
    | `message` | `string` | _(Optional)_ A custom error message provided by the caller. |

### `FinalContextMutationError`

Error thrown when attempting to mutate a context that was marked as `final`.

- **Extends:** `SafeContextError`

- **Constructor:** `constructor(mutation)`

    | Parameter  | Type                       | Description                                         |
    | ---------- | -------------------------- | --------------------------------------------------- |
    | `mutation` | `FinalContextMutationType` | The type of mutation attempt that caused the error. |

#### Instance Methods

- **`withKey(key)`**

    Attaches the key of a context that caused the error to the error message.

    | Parameter | Type     | Description                                       |
    | --------- | -------- | ------------------------------------------------- |
    | `key`     | `string` | The key of the context that could not be mutated. |

    **Returns:** This error instance, updated with the key specified for throwing..

### `MissingDependencyError`

Error thrown when a required runtime feature is not available.

- **Extends:** `SafeContextError`

- **Constructor:** `private constructor()`

#### Static Methods

- **`assert(...dependencies)`**

    Asserts that the required runtime dependencies are available in the global scope.

    | Parameter      | Type       | Description                                                                             |
    | -------------- | ---------- | --------------------------------------------------------------------------------------- |
    | `dependencies` | `string[]` | A list of global dependencies to check (e.g., `"Symbol.dispose"`, `"DisposableStack"`). |

    **Throws:**
    - `MissingDependencyError`: If any of the specified dependencies cannot be found.
    - `ReferenceError`: If the global scope object cannot be resolved.

### [`ArgumentsError`](/readme#argumentserror)

Error thrown by [`zod-guardians`](https://www.npmjs.com/package/zod-guardians) when the provided arguments do not match the runtime type validation schemas.

### [`OverloadsError`](/readme#overloadserror)

Error thrown by [`zod-guardians`](https://www.npmjs.com/package/zod-guardians) when using an overloaded method (e.g., `get`, `set`, `with`), and the provided arguments do not match any of the available signatures.
