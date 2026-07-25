import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

import type { AnyRenderable, ChildCapableRenderable, PropsOf } from '$lib/engine/ui-infra/composable-renderable';
import type { TrackingConfig } from '$lib/engine/math-utils/trackball-algorithms';
import type { RenderableSlotProps } from '$lib/engine/ui-infra/composable-renderable/types';

export type Control3DProps = {
	rotateX?: number;
	rotateY?: number;
	rotateZ?: number;
	depth?: number;
	compensateFaceScale?: boolean;
};

export type SurfaceProps<TSurface extends ChildCapableRenderable> = RenderableSlotProps<TSurface, 'surface', false>;

export type BackFaceProps<TBackFace extends AnyRenderable> = RenderableSlotProps<TBackFace, 'backFace', false>;

export type PrimaryFaceProps<TFace extends AnyRenderable> =
	| (RenderableSlotProps<TFace, 'face'> & {
			children?: never;
	  })
	| {
			face?: never;
			faceProps?: never;
			children: Snippet;
	  };

export type Element3DProps<
	TSurface extends ChildCapableRenderable,
	TFace extends AnyRenderable,
	TBackFace extends AnyRenderable
> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
	Control3DProps &
	SurfaceProps<TSurface> &
	PrimaryFaceProps<TFace> &
	BackFaceProps<TBackFace> & {
		thisElement?: HTMLDivElement;
	};

export type FlippableElement3DProps<
	TSurface extends ChildCapableRenderable,
	TFace extends AnyRenderable,
	TBackFace extends AnyRenderable
> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
	Omit<Control3DProps, 'rotateX' | 'rotateY' | 'rotateZ'> &
	SurfaceProps<TSurface> &
	PrimaryFaceProps<TFace> &
	BackFaceProps<TBackFace> & {
		thisElement?: HTMLDivElement;
	};

export type TrackingElement3DProps<
	TSurface extends ChildCapableRenderable = ChildCapableRenderable,
	TFace extends AnyRenderable = AnyRenderable,
	TBackFace extends AnyRenderable = AnyRenderable
> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
	Omit<Control3DProps, 'rotateX' | 'rotateY'> &
	SurfaceProps<TSurface> &
	PrimaryFaceProps<TFace> &
	BackFaceProps<TBackFace> & {
		thisElement?: HTMLDivElement;
		trackingConfig?: TrackingConfig;
		trackingAreaElement?: HTMLElement;
	};
