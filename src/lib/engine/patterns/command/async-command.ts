import type { CommandInterface } from './command';

export interface AsyncCommandInterface<R = void> extends CommandInterface<Promise<R>> {}
