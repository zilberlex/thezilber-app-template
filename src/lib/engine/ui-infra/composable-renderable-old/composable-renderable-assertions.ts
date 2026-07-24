import type { Snippet } from 'svelte';

import type { Face } from './types';

export function resolveFaceOrChildren(
	face: Face | undefined,
	children: Snippet | undefined,
	componentName: string
): Face {
	const resolvedFace = face ?? children;

	if (resolvedFace === undefined) {
		throw new TypeError(`${componentName} must receive either a face snippet or children.`);
	}

	return resolvedFace;
}
