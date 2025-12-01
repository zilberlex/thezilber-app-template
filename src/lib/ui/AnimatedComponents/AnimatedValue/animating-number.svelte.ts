import { floorTo } from '$lib/engine/animation/math-utils';
import {
	createAnimationControlTween,
	type TBasedAnimationParams,
	type TweenAnimationParams
} from '$lib/engine/animation/animations/tweens';
import { untrack } from 'svelte';
import type {
	AnimationControl,
	AnimationTween,
	AnimationTweenFactory
} from '$lib/engine/animation/animation.types';
import { createLerpTween } from '$lib/engine/animation/animations/lerp-tween';

export class AnimatingValue {
	oldValue: number = $state(0);
	value: number = $state(0);
	displayValue: number = $state(0);
	digitsAfterDec: number = $state(0);
	displayFunc: (currentValue: number, endValue: number) => string = (currentValue, endValue) =>
		currentValue.toString();
	displayValueString: string = $derived(this.displayFunc(this.displayValue, this.value));
	duration: number;
	animationTweenBuilder: AnimationTweenFactory;

	#currentAnimationControl: AnimationControl<TBasedAnimationParams> | undefined;

	private constructor(
		initialValue = 0,
		duration = 1000,
		animationTweenFactory: AnimationTweenFactory
	) {
		this.duration = duration;
		this.value = initialValue;
		this.animationTweenBuilder = animationTweenFactory;

		$effect(() => {
			console.log('WOW effect triggered - value', this.value);

			const newValue = this.value;
			untrack(() => {
				this.triggerValueChange(newValue);
				this.oldValue = this.value;
			});
		});
	}

	private triggerValueChange(newValue: number) {
		// this.animateDisplayValue(newValue);
		this.animateDisplayValueV2(newValue);
	}

	// Cast-free default for the common case:
	static withBasicTween(initialValue = 0, animationDuration = 1000) {
		return new AnimatingValue(initialValue, animationDuration, createLerpTween);
	}

	static with(
		initialValue = 0,
		animationDuration = 1000,
		tweenFactory: (from: number, to: number) => AnimationTween
	) {
		return new AnimatingValue(initialValue, animationDuration, tweenFactory);
	}

	public animateDisplayValueV2(newValue: number) {
		this.#currentAnimationControl?.stop();

		const ctl = createAnimationControlTween(
			this.animationTweenBuilder(this.displayValue, newValue),
			(v: number) => (this.displayValue = floorTo(v, this.digitsAfterDec)),
			{ duration: this.duration }
		);

		this.#currentAnimationControl = ctl;

		this.#currentAnimationControl?.start();
	}

	public async rerunAnimationFrom(startingValue: number) {
		this.displayValue = startingValue;
		this.triggerValueChange(this.value);
	}
}
