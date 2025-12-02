export type Command = {
	execute: () => boolean;
	undo: () => void;
	readonly executed: boolean;
};
