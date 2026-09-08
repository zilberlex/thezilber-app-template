import type { ElementInteraction } from '../../types';

export const nativeElementInteraction: ElementInteraction = {
	focus: (element) => element.focus(),
	click: (element) => element.click(),
	blur: (element) => element.blur()
};
