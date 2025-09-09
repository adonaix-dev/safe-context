type SetContextReturn<Options> = Options extends {
    override: false;
}
    ? boolean
    : true;

export type { SetContextReturn };
