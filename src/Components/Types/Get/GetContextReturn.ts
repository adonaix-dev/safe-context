type GetContextReturn<Type, Options> = Options extends {
    supply: any;
}
    ? Type
    : Type | undefined;

export type { GetContextReturn };
