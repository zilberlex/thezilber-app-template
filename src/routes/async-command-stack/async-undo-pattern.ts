export interface AsyncUndoPattern<R> {
	executeAsync: () => Promise<R>;
	undoAsync: () => Promise<void>;
}
