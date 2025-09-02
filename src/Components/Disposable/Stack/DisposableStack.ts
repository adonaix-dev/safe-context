import { SuppressedError } from "./Error/SuppressedError";

class DisposableStack implements Disposable {
    #stack: (() => void)[] = [];

    /** Disposes each resource in the stack in the reverse order that they were added. */
    dispose(): void {
        const stack = this.#stack;
        this.#stack = [];

        let caughtError: unknown;
        let caught: boolean = false;

        stack.forEach((dispose) => {
            try {
                dispose();
            } catch (error: unknown) {
                if (caught) {
                    caughtError = new SuppressedError(error, caughtError);
                } else {
                    caught = true;
                    caughtError = error;
                }
            }
        });

        if (caught) {
            throw caughtError;
        }
    }

    /**
     * Adds a disposable resource to the stack, returning the resource.
     *
     * @param value The resource to add. `null` and `undefined` will not be added, but
     *   will be returned.
     *
     * @returns The provided {@link value `value`}.
     */
    use<T extends Disposable>(value: T): T {
        this.#stack.push(value[Symbol.dispose]);
        return value;
    }

    [Symbol.dispose](): void {
        this.dispose();
    }
}

export { DisposableStack };
