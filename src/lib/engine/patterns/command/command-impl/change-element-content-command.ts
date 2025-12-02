import type { Command } from '../command';
import { wrapAutoResetCommand } from './auto-reset-command';

/**
 * Creates A command to change textContent of an element.
 * Execute: Changes the textContent of the element with replacedText.
 * Undo: Will revert back to original textContent.
 *  * The revert will happen only of the element contains at the time of revert the replacedText. */
export function createChangeElementTextContentCommand(
	target: Element,
	replacedText: string
): Command {
	let orgText = '';
	let wasExecuted = false;
	return {
		execute: () => {
			if (wasExecuted) {
				return false;
			}

			orgText = target.innerHTML;
			target.innerHTML = replacedText;
			wasExecuted = true;

			return true;
		},
		undo: () => {
			if (wasExecuted) {
				// To protect against conditions where the element had it's content changed after the execution of this command
				if (target.innerHTML === replacedText) {
					target.innerHTML = orgText;
				}

				wasExecuted = false;
			}
		},
		get executed() {
			return wasExecuted;
		}
	};
}

/**
 * Creates a Command that generates a temporary Replaced Text on the element.
 * * Useful for copy buttons.
 *
 * Execute: Sets the textContent of target element with replacedText. After durationMs Expires, reverts back to original
 * * The revert will happen only of the element contains at the time of revert the replacedText.
 *
 * Rapid Executions of the Command will refresh the duration. */
export function createChangeElementTextContentTemporaryCommand(
	target: Element,
	replacedText: string,
	durationMs: number
) {
	return wrapAutoResetCommand(
		createChangeElementTextContentCommand(target, replacedText),
		durationMs
	);
}
