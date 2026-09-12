import type { Command } from './command';

export interface AsyncCommandInterface<R = void> extends Command<Promise<R>> {}
