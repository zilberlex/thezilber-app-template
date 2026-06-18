export interface UndoPattern<R> {
	execute: () => R;
	undo: () => void;
}
