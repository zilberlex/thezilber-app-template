type ToggleAction = (toggleState: boolean) => void;

type BindableValue<T> = {
	get: () => T;
	set: (v: T) => void;
};

export class ActionsMenuEntry {
	action?: ToggleAction;
	toggle: boolean;
	name: string;
	#bindableValue?: BindableValue<boolean>;

	constructor(name: string, action?: ToggleAction, bindableValue?: BindableValue<boolean>) {
		this.name = name;
		this.#bindableValue = bindableValue;

		this.toggle = $state(bindableValue?.get() ?? false);
		this.action = action;

		$effect(() => {
			this.#bindableValue?.set(this.toggle);
		});
	}

	static create(actionParams: { name: string; action?: ToggleAction; bindableValue?: BindableValue<boolean> }) {
		const { name, action, bindableValue } = actionParams;
		return new ActionsMenuEntry(name, action, bindableValue);
	}
}
