export interface Command<R = void> {
	execute: () => R;
	undo: () => R;
	get executed(): boolean;
}
