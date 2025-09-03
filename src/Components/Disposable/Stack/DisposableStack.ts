import { SuppressedError } from "./Error/SuppressedError";

class DisposableStack implements Disposable {
    #stack: (() => void)[] = [];

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

    use<T extends Disposable>(value: T): T {
        this.#stack.push(value[Symbol.dispose]);
        return value;
    }

    [Symbol.dispose](): void {
        this.dispose();
    }
}

export { DisposableStack };
