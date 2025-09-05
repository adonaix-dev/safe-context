import type { SetContextOptions } from "./SetContextOptions";

type SetContextReturn<Options extends SetContextOptions> = Options extends {
    override: false;
}
    ? boolean
    : true;

export type { SetContextReturn };
