import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

import type {
	AnyRenderable,
	ChildCapableRenderable,
	RenderableSlotProps
} from '$lib/packages/svelte/composable-renderable';
import type { TrackingConfig } from '$lib/packages/core';

export type Control3DProps = {
	rotateX?: number;
	rotateY?: number;
	rotateZ?: number;
	depth?: number;
	compensateFaceScale?: boolean;
};

export type Element3DSurfaceSlotProps<TSurface extends ChildCapableRenderable> = RenderableSlotProps<
	TSurface,
	'surface',
	false
>;

export type Element3DBackFaceSlotProps<TBackFace extends AnyRenderable> = RenderableSlotProps<
	TBackFace,
	'backFace',
	false
>;

export type Element3DPrimaryFaceSlotProps<TFace extends AnyRenderable> =
	| (RenderableSlotProps<TFace, 'face'> & {
			children?: never;
	  })
	| {
			face?: never;
			faceProps?: never;
			children: Snippet;
	  };

export type Element3DProps<
	TSurface extends ChildCapableRenderable = ChildCapableRenderable,
	TFace extends AnyRenderable = AnyRenderable,
	TBackFace extends AnyRenderable = AnyRenderable
> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
	Control3DProps &
	Element3DSurfaceSlotProps<TSurface> &
	Element3DPrimaryFaceSlotProps<TFace> &
	Element3DBackFaceSlotProps<TBackFace> & {
		thisElement?: HTMLDivElement;
	};

export type FlippableElement3DProps<
	TSurface extends ChildCapableRenderable = ChildCapableRenderable,
	TFace extends AnyRenderable = AnyRenderable,
	TBackFace extends AnyRenderable = AnyRenderable
> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
	Omit<Control3DProps, 'rotateX' | 'rotateY' | 'rotateZ'> &
	Element3DSurfaceSlotProps<TSurface> &
	Element3DPrimaryFaceSlotProps<TFace> &
	Element3DBackFaceSlotProps<TBackFace> & {
		thisElement?: HTMLDivElement;
	};

export type TrackingElement3DProps<
	TSurface extends ChildCapableRenderable = ChildCapableRenderable,
	TFace extends AnyRenderable = AnyRenderable,
	TBackFace extends AnyRenderable = AnyRenderable
> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
	Omit<Control3DProps, 'rotateX' | 'rotateY'> &
	Element3DSurfaceSlotProps<TSurface> &
	Element3DPrimaryFaceSlotProps<TFace> &
	Element3DBackFaceSlotProps<TBackFace> & {
		thisElement?: HTMLDivElement;
		trackingConfig?: TrackingConfig;
		trackingAreaElement?: HTMLElement;
	};
