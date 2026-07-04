import type { CommandInterface } from '../command';
import { wrapAutoResetCommand } from './auto-reset-command';

/**
 * Creates A command to add a cssClass to an element.
 * Execute: Adds the specified class to the target Element.
 * Undo: will remove the cssClass.
 *  * the class will be removed only if the class was added due to command execution. */
export function createAddCssClassCommand(target: Element, cssClass: string): CommandInterface<boolean> {
	let wasExecuted = false;
	return {
		execute: () => {
			if (wasExecuted || target.classList.contains(cssClass)) {
				return false;
			}

			target.classList.add(cssClass);
			wasExecuted = true;

			return true;
		},
		undo: () => {
			let ret = false;
			if (wasExecuted) {
				target.classList.remove(cssClass);
				wasExecuted = false;

				ret = true;
			}

			return ret;
		},
		get executed() {
			return wasExecuted;
		}
	};
}

/**
 * Creates a Command that generates a temporary Css Style on the target element.
 * Execute: Sets a cssClass on the target element, and will remove it after durationMs.
 * * Will only remove the class if the class was not present when the command was executed.
 *
 * Rapid Executions of the Command will refresh the duration. */
export function createAddTempCssClassCommand(target: Element, cssClass: string, durationMs: number) {
	return wrapAutoResetCommand(createAddCssClassCommand(target, cssClass), durationMs);
}
