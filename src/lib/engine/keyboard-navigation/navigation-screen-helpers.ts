import { appState } from '$lib/engine/state/application-state.svelte';
import {
	isElementInViewDebugContext as isElementInViewDebugContext,
} from '$lib/app/state/debugging-context.svelte';

export type OutOfBoundsObjectType = {
	topOutOfBounds: number;
	leftOutOfBounds: number;
	bottomOutOfBounds: number;
	rightOutOfBounds: number;
};

export function checkOutOfBounds(nodeRect: DOMRect, viewRect: DOMRect) {
	let outOfBoundsObj = {
		topOutOfBounds: viewRect.top - nodeRect.top,
		leftOutOfBounds: viewRect.left - nodeRect.left,
		bottomOutOfBounds: nodeRect.bottom - viewRect.bottom,
		rightOutOfBounds: nodeRect.right - viewRect.right
	};

	if (appState.debug) {
		isElementInViewDebugContext.viewPortViewRect = viewRect;
		isElementInViewDebugContext.targetNodeViewRect = nodeRect;
		isElementInViewDebugContext.outOfBoundsObj = outOfBoundsObj;
		isElementInViewDebugContext.topCheck = `viewPortTop: [${viewRect.top}], nodeRectTop: [${nodeRect.top}], topDelta: [${outOfBoundsObj.topOutOfBounds}], IsTopInView: [${outOfBoundsObj.topOutOfBounds <= 0}]`;
		isElementInViewDebugContext.leftCheck = `viewPortLeft: [${viewRect.left}], nodeRectLeft: [${nodeRect.left}], leftDelta: [${outOfBoundsObj.leftOutOfBounds}], IsLeftInView: [${outOfBoundsObj.leftOutOfBounds <= 0}]`;
		isElementInViewDebugContext.bottomCheck = `viewPortBottom: [${viewRect.bottom}], nodeRectBottom: [${nodeRect.bottom}], bottomDelta: [${outOfBoundsObj.bottomOutOfBounds}], IsBottomInView: [${outOfBoundsObj.bottomOutOfBounds <= 0}]`;
		isElementInViewDebugContext.rightCheck = `viewPortLeft: [${viewRect.left}], left: [${nodeRect.left}], leftDelta: [${outOfBoundsObj.leftOutOfBounds}], leftInView: [${outOfBoundsObj.leftOutOfBounds <= 0}]`;

		isElementInViewDebugContext.isElementInView =
			outOfBoundsObj.topOutOfBounds <= 0 &&
			outOfBoundsObj.leftOutOfBounds <= 0 &&
			outOfBoundsObj.bottomOutOfBounds <= 0 &&
			outOfBoundsObj.rightOutOfBounds <= 0;
	}

	return outOfBoundsObj;
}

export function getWindowBoundingRect(): DOMRect {
	return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}
