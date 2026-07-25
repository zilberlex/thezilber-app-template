import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

import type { AnyRenderable, ChildCapableRenderable, PropsOf } from '$lib/engine/ui-infra/composable-renderable';

export type Control3DProps = {
	rotateX?: number;
	rotateY?: number;
	rotateZ?: number;
	depth?: number;
	compensateFaceScale?: boolean;
};

export type SurfaceProps<TSurface extends ChildCapableRenderable> = {
	surface?: TSurface;
	surfaceProps?: PropsOf<TSurface>;
};

export type PrimaryFaceProps<TFace extends AnyRenderable> =
	| {
			face: TFace;
			faceProps: PropsOf<TFace>;
			children?: never;
	  }
	| {
			face?: never;
			faceProps?: never;
			children: Snippet;
	  };

export type BackFaceProps<TBackFace extends AnyRenderable> = {
	backFace?: TBackFace;
	backFaceProps?: PropsOf<TBackFace>;
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
