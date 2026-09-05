import { getFocusableElementsByNode, isFocusableElement } from './navigation-utils';
import type { KeyboardNavigationTarget, NavigationTargetId } from './types';

export class KeyboardNavigationTargetImpl implements KeyboardNavigationTarget {
	readonly id: NavigationTargetId;
	#targetElementRef: WeakRef<HTMLElement>;

	constructor(id: NavigationTargetId, targetElement: HTMLElement) {
		this.id = id;
		this.#targetElementRef = new WeakRef(targetElement);
	}

	get targetElement() {
		return this.#targetElementRef.deref();
	}

	get navigatableNode(): HTMLElement | undefined {
		return this.#resolveNavigationTargetElement();
	}

	#resolveNavigationTargetElement(): HTMLElement | undefined {
		const targetElement = this.targetElement;

		if (!targetElement || !targetElement.isConnected) {
			console.warn('KeyboardNavigationTargetImpl no longer part of the document', {
				id: this.id,
				targetElementRef: this.#targetElementRef,
				isConnected: targetElement?.isConnected
			});
			return;
		}

		if (isFocusableElement(targetElement)) {
			return targetElement;
		}

		return getFocusableElementsByNode(targetElement)[0];
	}
}

export function keyboardNavigationTarget(id: NavigationTargetId, targetElement: HTMLElement) {
	return new KeyboardNavigationTargetImpl(id, targetElement);
}
