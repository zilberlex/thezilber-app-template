export interface AsyncCommandInterface<R = void> {
	execute: () => Promise<R>;
	undo: () => Promise<R>;
	persistCommand: any;
}
