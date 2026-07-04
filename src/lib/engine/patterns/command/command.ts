export interface CommandInterface<R = void> {
	execute: () => R;
	undo: () => R;
	get executed(): boolean;
	persistCommand: any;
}
