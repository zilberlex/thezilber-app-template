import type {
	Face,
	FaceChildrenProps,
	NamedFaceProps,
	Surface,
	SurfaceProps
} from '$lib/engine/ui-infra/composable-renderable/types';
import type { HTMLAttributes } from 'svelte/elements';

type Control3DProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	rotateX?: number;
	rotateY?: number;
	rotateZ?: number;

	compensateFaceScale?: boolean;

	thisElement?: HTMLDivElement;
};

export type Element3DProps<
	TSurface extends Surface = Surface,
	TFace extends Face = Face,
	TBackFace extends Face = Face
> = Control3DProps & SurfaceProps<TSurface, false> & FaceChildrenProps<TFace> & NamedFaceProps<'backFace', TBackFace>;
