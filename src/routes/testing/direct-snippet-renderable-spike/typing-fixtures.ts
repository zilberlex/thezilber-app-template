import type { Snippet } from 'svelte';

import type {
	CandidateRenderableSlotProps,
	DirectFaceSiteProps,
	DirectRenderableSiteProps,
	RenderableInput
} from './candidate-types';

declare const snippetWithoutProps: Snippet;
declare const snippetWithProps: Snippet<
	[props: { label: string; count: number }]
>;

function acceptRenderable<TRenderable extends RenderableInput>(
	props: DirectRenderableSiteProps<TRenderable>
): void {
	void props;
}

function acceptFace<TFace extends RenderableInput>(
	props: DirectFaceSiteProps<TFace>
): void {
	void props;
}

acceptRenderable({
	renderable: snippetWithoutProps
});

acceptRenderable({
	renderable: snippetWithoutProps,
	props: {}
});

acceptRenderable({
	renderable: snippetWithProps,
	props: {
		label: 'Typed snippet',
		count: 1
	}
});

// @ts-expect-error Required snippet props cannot be omitted.
acceptRenderable({
	renderable: snippetWithProps
});

acceptRenderable({
	renderable: snippetWithProps,
	props: {
		// @ts-expect-error label must be a string.
		label: 123,
		count: 1
	}
});

acceptRenderable({
	renderable: snippetWithProps,
	props: {
		label: 'Typed snippet',
		count: 1,
		// @ts-expect-error Unknown snippet props must be rejected.
		unknown: true
	}
});

acceptRenderable({
	renderable: snippetWithoutProps,
	props: {
		// @ts-expect-error A zero-prop snippet does not accept arbitrary props.
		unknown: true
	}
});

acceptFace({
	face: snippetWithoutProps
});

acceptFace({
	face: snippetWithProps,
	faceProps: {
		label: 'Typed face',
		count: 2
	}
});

// @ts-expect-error Required face props cannot be omitted.
acceptFace({
	face: snippetWithProps
});

type OptionalFace = CandidateRenderableSlotProps<
	typeof snippetWithProps,
	'face',
	false
>;

const absentOptionalFace: OptionalFace = {};
void absentOptionalFace;

// @ts-expect-error faceProps cannot exist without face.
const orphanFaceProps: OptionalFace = {
	faceProps: {
		label: 'Orphan',
		count: 3
	}
};
void orphanFaceProps;
