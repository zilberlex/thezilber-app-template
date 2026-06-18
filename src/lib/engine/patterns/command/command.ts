export type Command = {
	execute: () => void;
	undo: () => void;
	readonly executed: boolean;
};
