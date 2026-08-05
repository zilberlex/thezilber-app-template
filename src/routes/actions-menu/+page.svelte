<script lang="ts">
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { ActionsMenuEntry } from './action-menu-entry.svelte';
	import ActionsMenu from './ActionsMenu.svelte';
	import type { ActionWithCleanup } from './types';

	function createToggleRule(action: ActionWithCleanup) {
		let on = false;
		let undo = () => {};

		return (toggleState: boolean) => {
			if (toggleState && !on) {
				on = true;
				undo = action();
			} else if (!toggleState && on) {
				on = false;
				undo();
			} else {
				console.warn('Toggle Action State Mismatch', {
					on,
					toggleState
				});
			}
		};
	}

	function addCssRule(cssClass: string, rules: string) {
		const style = document.createElement('style');

		style.textContent = `
	  	  .${cssClass} {
       ${rules}
	  	}
	  `;

		document.head.append(style);

		return () => style.remove();
	}

	const enableDebugMenuMouse = createToggleRule(() => addCssRule('debug-layer', 'pointer-events: auto !important;'));

	const actions: ActionsMenuEntry[] = [
		ActionsMenuEntry.create({ name: 'Debug Menu Pointer Events', action: enableDebugMenuMouse }),
		ActionsMenuEntry.create({
			name: 'Toggle Debug',
			bindableValue: {
				get: () => appState.debug.debugConsole,
				set: (v) => (appState.debug.debugConsole = v)
			}
		})
	];
</script>

<ActionsMenu {actions} />
