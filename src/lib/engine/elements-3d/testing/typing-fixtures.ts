import type { Snippet } from 'svelte';

import type { AnyRenderable, ChildCapableRenderable } from '$lib/engine/ui-infra/composable-renderable';

import type { Element3DProps, FlippableElement3DProps, TrackingElement3DProps } from '../types';

declare const content: Snippet;
declare const plainFace: Snippet;

declare const labelledFace: Snippet<[props: { label: string }]>;

declare const labelledBackFace: Snippet<[props: { label: string }]>;

declare const labelledSurface: Snippet<[props: { variant: string }, content?: Snippet]>;

function acceptElement3D<
	TSurface extends ChildCapableRenderable,
	TFace extends AnyRenderable,
	TBackFace extends AnyRenderable
>(props: Element3DProps<TSurface, TFace, TBackFace>): void {
	void props;
}

acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	children: content
});

acceptElement3D<typeof labelledSurface, typeof plainFace, typeof labelledBackFace>({
	face: plainFace
});

acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	face: labelledFace,
	faceProps: {
		label: 'Front'
	}
});

// @ts-expect-error Required face props must be supplied.
acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	face: labelledFace
});

// @ts-expect-error A primary face and children are mutually exclusive.
acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	face: labelledFace,
	faceProps: {
		label: 'Front'
	},
	children: content
});

acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	children: content,
	surface: labelledSurface,
	surfaceProps: {
		variant: 'raised'
	}
});

// @ts-expect-error Required surface props must be supplied.
acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	children: content,
	surface: labelledSurface
});

acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	children: content,
	backFace: labelledBackFace,
	backFaceProps: {
		label: 'Back'
	}
});

// @ts-expect-error Back-face props require a back-face renderable.
acceptElement3D<typeof labelledSurface, typeof labelledFace, typeof labelledBackFace>({
	children: content,
	backFaceProps: {
		label: 'Back'
	}
});

type TrackingProps = TrackingElement3DProps<typeof labelledSurface, typeof plainFace, typeof labelledBackFace>;

function acceptTrackingElement3D(props: TrackingProps): void {
	void props;
}

acceptTrackingElement3D({
	children: content
});

acceptTrackingElement3D({
	children: content,

	// @ts-expect-error TrackingElement3D owns rotateX.
	rotateX: 10
});

acceptTrackingElement3D({
	children: content,

	// @ts-expect-error TrackingElement3D owns rotateY.
	rotateY: 10
});

type FlippableProps = FlippableElement3DProps<typeof labelledSurface, typeof plainFace, typeof labelledBackFace>;

function acceptFlippableElement3D(props: FlippableProps): void {
	void props;
}

acceptFlippableElement3D({
	children: content
});

acceptFlippableElement3D({
	children: content,

	// @ts-expect-error FlippableElement3D owns all rotation props.
	rotateZ: 10
});
