interface ContextWithReturn<Type> {
    context: Type;
    changed: boolean;
    previous?: Type;
}

export type { ContextWithReturn };
