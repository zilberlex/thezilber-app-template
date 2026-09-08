export type FocusableElement = HTMLElement | SVGElement;

export interface ElementInteraction {
	focus(element: FocusableElement): void;
	click(element: HTMLElement): void;
	blur(element: HTMLElement): void;
}
