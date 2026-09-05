<script lang="ts">
	import type { ActionWithCleanup } from '$lib/engine/patterns/cleanup-pattern';
	import { appState } from '$lib/engine/state/application-state.svelte';
	import { externalBinding } from '$lib/engine/svelte-helpers/binding.svelte';
	import { actionsMenuEntry, type ActionsMenuEntry } from '$lib/ui/components/actions-menu/action-menu-entry.svelte';
	import ActionsMenu from '$lib/ui/components/actions-menu/ActionsMenu.svelte';

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
		actionsMenuEntry({ name: 'Debug Menu Pointer Events', onToggle: enableDebugMenuMouse }),
		actionsMenuEntry({
			name: 'Toggle Debug Console',
			binding: externalBinding(
				() => appState.debug.debugConsole,
				(v) => (appState.debug.debugConsole = v)
			)
		}),
		actionsMenuEntry({
			name: 'Toggle Debug Mode',
			binding: externalBinding(
				() => appState.debug.debugMode,
				(v) => (appState.debug.debugMode = v)
			)
		})
	];
</script>

<ActionsMenu {actions} />
