import type { PersistedItem, PersistableItem } from './persistent-item';
import type { Command } from '../command';

export type PersistedCommand<CommandType extends string = string> = PersistedItem<CommandType>;

export type PersistableCommand<T = void> = Command<T> & PersistableItem<PersistedCommand>;
