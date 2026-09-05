import type { MousePos } from '$lib/engine/types/types';
import type { EasingFunction } from 'svelte/transition';
import { clamp, smoothstep } from './math-utils';

export const TRACKING_MODES = ['linear', 'plane', 'hemisphere', 'radial', 'sphere-hyperbolic'] as const;

export const BASE_TRACKING_DEFAULTS = {
	rotationScaleX: 1,
	rotationScaleY: 1,

	maxRotationX: undefined,
	maxRotationY: undefined
} satisfies ResolvedBaseTrackingOptions;

export const TRACKING_MODE_DEFAULTS = {
	linear: {
		edgeRotationX: 20,
		edgeRotationY: 20
	},

	plane: {
		planeDistance: 100,
		pointerScaleX: 1,
		pointerScaleY: 1
	},

	hemisphere: {
		radiusScaleX: 2,
		radiusScaleY: 2
	},

	radial: {
		radiusScaleX: 1,
		radiusScaleY: 1,
		maxTilt: 25,
		easing: smoothstep
	},

	'sphere-hyperbolic': {
		radiusScaleX: 5,
		radiusScaleY: 2
	}
} satisfies ResolvedModeOptionsByMode;

export type TrackingRotation = Readonly<{
	rotateX: number;
	rotateY: number;
}>;

/* -------------------------------------------------------------------------- */
/* Public options                                                             */
/* -------------------------------------------------------------------------- */

export type BaseTrackingOptions = Readonly<{
	/**
	 * Final multiplier applied after calculating rotation.
	 */
	rotationScaleX?: number;
	rotationScaleY?: number;

	/**
	 * Optional symmetric limits applied to the final rotation.
	 */
	maxRotationX?: number;
	maxRotationY?: number;
}>;

export type LinearModeOptions = Readonly<{
	/**
	 * Rotation reached when the pointer reaches an element edge.
	 */
	edgeRotationX?: number;
	edgeRotationY?: number;
}>;

export type PlaneModeOptions = Readonly<{
	/**
	 * Distance between the element plane and virtual mouse plane.
	 */
	planeDistance?: number;

	/**
	 * Scale the pointer displacement before creating the target normal.
	 */
	pointerScaleX?: number;
	pointerScaleY?: number;
}>;

export type HemisphereModeOptions = Readonly<{
	/**
	 * Size of the virtual ellipse relative to the element.
	 *
	 * 1 means the ellipse boundary matches the element boundary.
	 * Larger values produce gentler rotation.
	 */
	radiusScaleX?: number;
	radiusScaleY?: number;
}>;

export type RadialModeOptions = Readonly<{
	radiusScaleX?: number;
	radiusScaleY?: number;

	/**
	 * Maximum tilt angle in degrees.
	 */
	maxTilt?: number;

	/**
	 * Maps normalized pointer distance from 0..1 to tilt strength 0..1.
	 */
	easing?: EasingFunction;
}>;

export type VirtualTrackballModeOptions = Readonly<{
	radiusScaleX?: number;
	radiusScaleY?: number;
}>;

type ModeOptionsByMode = {
	linear: LinearModeOptions;
	plane: PlaneModeOptions;
	hemisphere: HemisphereModeOptions;
	radial: RadialModeOptions;
	'sphere-hyperbolic': VirtualTrackballModeOptions;
};

export type TrackingMode = (typeof TRACKING_MODES)[number];

export type TrackingOptionsByMode = {
	[Mode in TrackingMode]: BaseTrackingOptions & ModeOptionsByMode[Mode];
};

export type LinearTrackingOptions = TrackingOptionsByMode['linear'];
export type PlaneTrackingOptions = TrackingOptionsByMode['plane'];
export type HemisphereTrackingOptions = TrackingOptionsByMode['hemisphere'];
export type RadialTrackingOptions = TrackingOptionsByMode['radial'];
export type VirtualTrackballTrackingOptions = TrackingOptionsByMode['sphere-hyperbolic'];

export type TrackingConfig = {
	[Mode in TrackingMode]: {
		mode: Mode;
		options?: TrackingOptionsByMode[Mode];
	};
}[TrackingMode];

/* -------------------------------------------------------------------------- */
/* Resolved options                                                           */
/* -------------------------------------------------------------------------- */

type ResolvedBaseTrackingOptions = Readonly<{
	rotationScaleX: number;
	rotationScaleY: number;

	maxRotationX: number | undefined;
	maxRotationY: number | undefined;
}>;

type ResolvedModeOptionsByMode = {
	linear: Readonly<{
		edgeRotationX: number;
		edgeRotationY: number;
	}>;

	plane: Readonly<{
		planeDistance: number;
		pointerScaleX: number;
		pointerScaleY: number;
	}>;

	hemisphere: Readonly<{
		radiusScaleX: number;
		radiusScaleY: number;
	}>;

	radial: Readonly<{
		radiusScaleX: number;
		radiusScaleY: number;
		maxTilt: number;
		easing: EasingFunction;
	}>;

	'sphere-hyperbolic': Readonly<{
		radiusScaleX: number;
		radiusScaleY: number;
	}>;
};

type ResolvedTrackingOptionsByMode = {
	[Mode in TrackingMode]: ResolvedBaseTrackingOptions & ResolvedModeOptionsByMode[Mode];
};

type ResolvedTrackingOptions<Mode extends TrackingMode> = ResolvedTrackingOptionsByMode[Mode];

function withBaseDefaults<T extends object>(modeDefaults: T): ResolvedBaseTrackingOptions & T {
	return {
		...BASE_TRACKING_DEFAULTS,
		...modeDefaults
	};
}

/**
 * Complete resolved defaults for every mode.
 */
export const TRACKING_DEFAULTS = {
	linear: withBaseDefaults(TRACKING_MODE_DEFAULTS.linear),

	plane: withBaseDefaults(TRACKING_MODE_DEFAULTS.plane),

	hemisphere: withBaseDefaults(TRACKING_MODE_DEFAULTS.hemisphere),

	radial: withBaseDefaults(TRACKING_MODE_DEFAULTS.radial),

	'sphere-hyperbolic': withBaseDefaults(TRACKING_MODE_DEFAULTS['sphere-hyperbolic'])
} satisfies ResolvedTrackingOptionsByMode;

/**
 * Merges only defined values.
 *
 * This prevents an explicitly provided `undefined` from replacing a default.
 */
function mergeDefined<T extends object>(defaults: T, overrides?: object): T {
	const result: T = {
		...defaults
	};

	if (!overrides) {
		return result;
	}

	for (const [key, value] of Object.entries(overrides)) {
		if (value !== undefined) {
			Object.assign(result, {
				[key]: value
			});
		}
	}

	return result;
}

function resolveTrackingOptions<Mode extends TrackingMode>(
	mode: Mode,
	options: TrackingOptionsByMode[Mode] = {}
): ResolvedTrackingOptions<Mode> {
	return mergeDefined(TRACKING_DEFAULTS[mode], options);
}

/* -------------------------------------------------------------------------- */
/* Shared math                                                                */
/* -------------------------------------------------------------------------- */

const EPSILON = 0.000001;

const RADIANS_TO_DEGREES = 180 / Math.PI;
const DEGREES_TO_RADIANS = Math.PI / 180;

const ZERO_ROTATION: TrackingRotation = {
	rotateX: 0,
	rotateY: 0
};

function positiveNonZero(value: number): number {
	return Math.max(Math.abs(value), EPSILON);
}

function getPointerOffset(mousePosition: MousePos, rect: DOMRectReadOnly) {
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	return {
		dx: mousePosition.x - centerX,
		dy: mousePosition.y - centerY
	};
}

type EllipsePosition = Readonly<{
	x: number;
	y: number;
	distance: number;
}>;

function getEllipsePosition(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	radiusScaleX: number,
	radiusScaleY: number
): EllipsePosition {
	const { dx, dy } = getPointerOffset(mousePosition, rect);

	const radiusX = positiveNonZero((rect.width / 2) * radiusScaleX);
	const radiusY = positiveNonZero((rect.height / 2) * radiusScaleY);

	const x = dx / radiusX;
	const y = dy / radiusY;

	return {
		x,
		y,
		distance: Math.hypot(x, y)
	};
}

/**
 * Converts a target normal into rotations matching:
 *
 * transform:
 *     rotateY(var(--rotate-y))
 *     rotateX(var(--rotate-x));
 */
function normalToRotation(normalX: number, normalY: number, normalZ: number): TrackingRotation {
	const length = Math.hypot(normalX, normalY, normalZ);

	if (length < EPSILON) {
		return ZERO_ROTATION;
	}

	const x = normalX / length;
	const y = normalY / length;
	const z = normalZ / length;

	return {
		rotateX: -Math.atan2(y, Math.hypot(x, z)) * RADIANS_TO_DEGREES,

		rotateY: Math.atan2(x, z) * RADIANS_TO_DEGREES
	};
}

function applyBaseTrackingOptions(rotation: TrackingRotation, options: ResolvedBaseTrackingOptions): TrackingRotation {
	let rotateX = rotation.rotateX * options.rotationScaleX;
	let rotateY = rotation.rotateY * options.rotationScaleY;

	if (options.maxRotationX !== undefined) {
		const limit = Math.abs(options.maxRotationX);

		rotateX = clamp(rotateX, -limit, limit);
	}

	if (options.maxRotationY !== undefined) {
		const limit = Math.abs(options.maxRotationY);

		rotateY = clamp(rotateY, -limit, limit);
	}

	return {
		rotateX,
		rotateY
	};
}

function normalToFinalRotation(
	normalX: number,
	normalY: number,
	normalZ: number,
	options: ResolvedBaseTrackingOptions
): TrackingRotation {
	const rotation = normalToRotation(normalX, normalY, normalZ);

	return applyBaseTrackingOptions(rotation, options);
}

/* -------------------------------------------------------------------------- */
/* Linear                                                                     */
/* -------------------------------------------------------------------------- */

export function trackModeLinear(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	options: LinearTrackingOptions = {}
): TrackingRotation {
	const resolved = resolveTrackingOptions('linear', options);

	const position = getEllipsePosition(mousePosition, rect, 1, 1);

	const normalizedX = clamp(position.x, -1, 1);
	const normalizedY = clamp(position.y, -1, 1);

	return applyBaseTrackingOptions(
		{
			rotateX: -normalizedY * resolved.edgeRotationX,

			rotateY: normalizedX * resolved.edgeRotationY
		},
		resolved
	);
}

/* -------------------------------------------------------------------------- */
/* Plane                                                                      */
/* -------------------------------------------------------------------------- */

export function trackModePlane(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	options: PlaneTrackingOptions = {}
): TrackingRotation {
	const resolved = resolveTrackingOptions('plane', options);

	const { dx, dy } = getPointerOffset(mousePosition, rect);

	return normalToFinalRotation(
		dx * resolved.pointerScaleX,
		dy * resolved.pointerScaleY,
		positiveNonZero(resolved.planeDistance),
		resolved
	);
}

/* -------------------------------------------------------------------------- */
/* Hemisphere                                                                 */
/* -------------------------------------------------------------------------- */

export function trackModeHemisphere(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	options: HemisphereTrackingOptions = {}
): TrackingRotation {
	const resolved = resolveTrackingOptions('hemisphere', options);

	let {
		x: normalX,
		y: normalY,
		distance
	} = getEllipsePosition(mousePosition, rect, resolved.radiusScaleX, resolved.radiusScaleY);

	/*
	 * Clamp positions outside the ellipse onto its boundary.
	 */
	if (distance > 1) {
		normalX /= distance;
		normalY /= distance;
	}

	const normalZ = Math.sqrt(Math.max(0, 1 - normalX * normalX - normalY * normalY));

	return normalToFinalRotation(normalX, normalY, normalZ, resolved);
}

/* -------------------------------------------------------------------------- */
/* Radial                                                                     */
/* -------------------------------------------------------------------------- */

export function trackModeRadial(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	options: RadialTrackingOptions = {}
): TrackingRotation {
	const resolved = resolveTrackingOptions('radial', options);

	const { x, y, distance } = getEllipsePosition(mousePosition, rect, resolved.radiusScaleX, resolved.radiusScaleY);

	if (distance < EPSILON) {
		return ZERO_ROTATION;
	}

	const directionX = x / distance;
	const directionY = y / distance;

	const normalizedDistance = clamp(distance, 0, 1);

	const tiltStrength = clamp(resolved.easing(normalizedDistance), 0, 1);

	const tiltRadians = resolved.maxTilt * tiltStrength * DEGREES_TO_RADIANS;

	const horizontalNormalLength = Math.sin(tiltRadians);

	return normalToFinalRotation(
		directionX * horizontalNormalLength,
		directionY * horizontalNormalLength,
		Math.cos(tiltRadians),
		resolved
	);
}

/* -------------------------------------------------------------------------- */
/* Virtual trackball                                                          */
/* -------------------------------------------------------------------------- */

export function trackModeSphereHyperbolic(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	options: VirtualTrackballTrackingOptions = {}
): TrackingRotation {
	const resolved = resolveTrackingOptions('sphere-hyperbolic', options);

	const {
		x: normalX,
		y: normalY,
		distance
	} = getEllipsePosition(mousePosition, rect, resolved.radiusScaleX, resolved.radiusScaleY);

	const normalZ =
		distance <= Math.SQRT1_2 ? Math.sqrt(Math.max(0, 1 - distance * distance)) : 1 / positiveNonZero(2 * distance);

	return normalToFinalRotation(normalX, normalY, normalZ, resolved);
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                 */
/* -------------------------------------------------------------------------- */

export function calculateTrackingRotation(
	mousePosition: MousePos,
	rect: DOMRectReadOnly,
	config: TrackingConfig
): TrackingRotation {
	switch (config.mode) {
		case 'linear':
			return trackModeLinear(mousePosition, rect, config.options);

		case 'plane':
			return trackModePlane(mousePosition, rect, config.options);

		case 'hemisphere':
			return trackModeHemisphere(mousePosition, rect, config.options);

		case 'radial':
			return trackModeRadial(mousePosition, rect, config.options);

		case 'sphere-hyperbolic':
			return trackModeSphereHyperbolic(mousePosition, rect, config.options);
	}
}
