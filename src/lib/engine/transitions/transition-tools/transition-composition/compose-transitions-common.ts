/**
 * Configuration for the `composeTransitions` function.
 */
export interface ComposedTransitionParams {
	/** Global Delay for the compsed transition start. Every subtransition delay will be added to this value. */
	delay?: number;
	/** Menually set the duration of transition. If not set, the transition will end when the last transition ends.
	 * (global duration = globalDelay + lastTransitionDuration + lastTransitionDelay)
	 *
	 * if Duration is set to be less than the last transition, then the transition will be cut off. */
	duration?: number;

	/** Optimizes the css output by removing the transitions which are not in the window.
	 *  Will Cause issues if transitions have overlapping Effects (eg fade and slide both modify opacity).
	 */
	optimizeCss?: boolean;

	/** Reverses the transitions.
	 * - Useful for Out Transitions as they are usually reversed - allows to compose from an out perpective */
	reverse?: boolean;

	easing?: (t: number) => number;
}
