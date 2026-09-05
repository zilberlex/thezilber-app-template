import type { Component, Snippet } from 'svelte';

import { componentRenderable } from '../renderable-factories';
import type { AnyRenderable, ComposedComponentProps, RenderableSlotProps } from '../types';

declare const content: Snippet;

declare const plainSnippet: Snippet;

declare const labelledSnippet: Snippet<[props: { label: string }]>;

declare const LabelComponent: Component<{
	label: string;
	children?: Snippet;
}>;

const labelComponentRenderable = componentRenderable(LabelComponent);

function acceptComposedComponent<TRenderable extends AnyRenderable>(props: ComposedComponentProps<TRenderable>): void {
	void props;
}

acceptComposedComponent<typeof plainSnippet>({
	renderable: plainSnippet
});

acceptComposedComponent<typeof plainSnippet>({
	renderable: plainSnippet,
	props: {}
});

acceptComposedComponent<typeof plainSnippet>({
	renderable: plainSnippet,
	props: {
		// @ts-expect-error A zero-prop snippet must not accept arbitrary props.
		unknown: true
	}
});

acceptComposedComponent<typeof labelledSnippet>({
	renderable: labelledSnippet,
	props: {
		label: 'Correct'
	}
});

// @ts-expect-error Required snippet props must be supplied.
acceptComposedComponent<typeof labelledSnippet>({
	renderable: labelledSnippet
});

acceptComposedComponent<typeof labelledSnippet>({
	renderable: labelledSnippet,
	props: {
		// @ts-expect-error The label prop must be a string.
		label: 123
	}
});

acceptComposedComponent<typeof labelledSnippet>({
	renderable: labelledSnippet,
	props: {
		label: 'Correct',

		// @ts-expect-error Unknown snippet props must be rejected.
		unknown: true
	}
});

acceptComposedComponent<typeof labelComponentRenderable>({
	renderable: labelComponentRenderable,
	props: {
		label: 'Component'
	},
	content
});

acceptComposedComponent<typeof labelComponentRenderable>({
	renderable: labelComponentRenderable,
	props: {
		label: 'Component',

		// @ts-expect-error Component children are infrastructure-owned.
		children: content
	}
});

type RequiredFaceSlot = RenderableSlotProps<typeof labelledSnippet, 'face'>;

function acceptRequiredFaceSlot(props: RequiredFaceSlot): void {
	void props;
}

acceptRequiredFaceSlot({
	face: labelledSnippet,
	faceProps: {
		label: 'Front'
	}
});

// @ts-expect-error Required face props must be supplied.
acceptRequiredFaceSlot({
	face: labelledSnippet
});

type OptionalBackFaceSlot = RenderableSlotProps<typeof labelledSnippet, 'backFace', false>;

function acceptOptionalBackFaceSlot(props: OptionalBackFaceSlot): void {
	void props;
}

acceptOptionalBackFaceSlot({});

acceptOptionalBackFaceSlot({
	backFace: labelledSnippet,
	backFaceProps: {
		label: 'Back'
	}
});

// @ts-expect-error Slot props cannot exist without the slot renderable.
acceptOptionalBackFaceSlot({
	backFaceProps: {
		label: 'Back'
	}
});
