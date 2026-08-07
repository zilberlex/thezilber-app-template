import { createStateBinding, type Binding } from '$lib/engine/svelte-helpers/binding.svelte';

type ToggleAction = (value: boolean) => void;

type ActionsMenuEntryParams = {
	name: string;
	onToggle?: ToggleAction;
	binding?: Binding<boolean>;
};

export function actionsMenuEntry({ name, onToggle, binding = createStateBinding(false) }: ActionsMenuEntryParams) {
	return {
		name,
		onToggle,
		get toggle() {
			return binding.value;
		},

		set toggle(v: boolean) {
			binding.value = v;
		}
	};
}

export type ActionsMenuEntry = ReturnType<typeof actionsMenuEntry>;
