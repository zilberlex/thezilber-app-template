import type { EasingFunction, TransitionConfig } from 'svelte/transition';
import { linear } from 'svelte/easing';
import type { TransitionParamsCommon } from './transition-tools/transitions-common';

type TypewriterParams = TransitionParamsCommon & {
	speed?: number;
};

export function typewriter(node: Element, { speed = 1, easing = linear }: TypewriterParams = {}): TransitionConfig {
	const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

	const textNodes: Array<{
		node: Text;
		characters: string[];
	}> = [];

	let currentNode: Text | null;

	while ((currentNode = walker.nextNode() as Text | null)) {
		textNodes.push({
			node: currentNode,
			characters: Array.from(currentNode.data)
		});
	}

	const totalLength = textNodes.reduce((total, item) => total + item.characters.length, 0);

	const duration = totalLength / (speed * 0.01);

	return {
		duration,
		easing,

		tick(t) {
			let remainingCharacters = Math.trunc(totalLength * t);

			for (const item of textNodes) {
				const visibleLength = Math.min(remainingCharacters, item.characters.length);

				item.node.data = item.characters.slice(0, visibleLength).join('');

				remainingCharacters -= visibleLength;
			}
		}
	};
}
