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

#### Static Methods

- **`create<Dictionary>(options?)`**

    Creates a new `SafeContext` instance.

    | Parameter          | Type                           | Description                                                                                                                                                                                                                  |
    | ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `options`          | `SafeContextOptions`           | _(Optional)_ Configuration for the new instance.                                                                                                                                                                             |
    | `options.hideKeys` | `true \| (keyof Dictionary)[]` | _(Optional)_ Hides specified keys from being shown when the instance is inspected (e.g., via `console.log`) or captured in the snapshot. If `true`, all keys are hidden; or if an array of keys, only those keys are hidden. |

    **Returns:** `SafeContext<Dictionary>`

    **Throws:**
    - `ArgumentsError`: If `options.hideKeys` is not `true` or of type `string[]`.

#### Instance Methods

- **`has(key)`**

    Checks if a context value is currently set without retrieving it.

    | Parameter | Type               | Description       |
    | --------- | ------------------ | ----------------- |
    | `key`     | `keyof Dictionary` | The key to check. |

    **Returns:** `true` if the key exists in the registry, `false` otherwise.

    **Throws:**
    - `ArgumentsError`: If `key` is not a string.

- **`get(key, options?)`**

    Retrieves a single context value by its key.

    | Parameter        | Type                | Description                                                                                                                                |
    | ---------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
    | `key`            | `keyof Dictionary`  | The key of the context to retrieve.                                                                                                        |
    | `options`        | `GetContextOptions` | _(Optional)_ Options for the retrieval operation.                                                                                          |
    | `options.supply` | `() => Type`        | _(Optional)_ A function that supplies a default value if the context is not already set. The supplied value will be set and then returned. |

    **Returns:** The context value, or `undefined` if it's not set and no `options.supply` function is provided.

    **Throws:**
    - `OverloadsError`: If no overload matches the provided arguments.

- **`get(keys, options?)`**

    Retrieves multiple context values.

    | Parameter             | Type                        | Description                                                                                                                                |
    | --------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
    | `keys`                | `(keyof Dictionary)[]`      | An array of keys to retrieve.                                                                                                              |
    | `options`             | `GetMultipleContextOptions` | _(Optional)_ Options for the retrieval operation, applicable to each key.                                                                  |
    | `options[key].supply` | `() => Type`                | _(Optional)_ A function that supplies a default value if the context is not already set. The supplied value will be set and then returned. |

    **Returns:** An object containing the retrieved key-value pairs.

    **Throws:**
    - `OverloadsError`: If no overload matches the provided arguments.

- **`require(key)`**

    Retrieves a context value, throwing an error if it is not set.

    | Parameter | Type               | Description                                                                                                                                              |
    | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `key`     | `keyof Dictionary` | The key of the context to retrieve.                                                                                                                      |
    | `message` | `string`           | _(Optional)_ A custom error message to be thrown if the context is not found. If not provided, a default message including the context key will be used. |

    **Returns:** The context value.

    **Throws:**
    - `ContextNotFoundError`: If the context is not found.
    - `ArgumentsError`: If `key` is not a string or if `message` is passed but it's not a string.
