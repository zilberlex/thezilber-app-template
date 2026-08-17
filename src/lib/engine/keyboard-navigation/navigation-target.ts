import { getFocusableElementsByNode, isFocusableElement } from './navigation-utils';
import type { KeyboardNavigationTarget } from './types';

export class KeyboardNavigationTargetImpl implements KeyboardNavigationTarget {
	readonly id: string;
	readonly targetElement: HTMLElement;

	constructor(id: string, targetElement: HTMLElement) {
		this.id = id;
		this.targetElement = targetElement;
	}

	get navigatableNode(): HTMLElement | undefined {
		return this.#resolveNavigationTargetElement();
	}

	#resolveNavigationTargetElement(): HTMLElement | undefined {
		const targetElement = this.targetElement;

		if (isFocusableElement(targetElement)) {
			return targetElement;
		}

		return getFocusableElementsByNode(targetElement)[0];
	}
}

export function keyboardNavigationTarget(id: string, targetElement: HTMLElement) {
	return new KeyboardNavigationTargetImpl(id, targetElement);
}
