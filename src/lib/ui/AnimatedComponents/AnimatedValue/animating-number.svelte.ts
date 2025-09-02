import { type AnimationControl } from "$lib/engine/animation/animation-control";
import { floorTo } from "$lib/engine/animation/math-utils";
import { type TBasedAnimationParams, type TweenAnimationParams } from "$lib/engine/animation/tweens";
import { untrack } from "svelte";
import { createValueTweenAnimation } from "./animating-value.tween.svelte";

export type ValueChangeAnimationInput = {
    // Params for tween animation
    oldValue: number;
    newValue: number;
    currentDisplayValue: number;

    // Meta params for flexibility.
    oldCtl: AnimationControl<TweenAnimationParams> | undefined;

    // Callback for value updates within the AnimationControl Returned.
    updateValue: (newValue: number) => void;
}

type CreateAnimationFn<T extends TBasedAnimationParams> =
  (valueChange: ValueChangeAnimationInput) =>
    { ctl: AnimationControl<T>; params: Partial<T> };

export class AnimatingValue<T extends TBasedAnimationParams> {
	oldValue: number = $state(0);
    value: number = $state(0);
	displayValue: number = $state(0);
    digitsAfterDec: number = $state(0);

    createAnimationFunction: CreateAnimationFn<T>;

    #currentAnimationControl: AnimationControl<T> | undefined;

    private constructor(initialValue = 0, fn: CreateAnimationFn<T>) {
		this.value = initialValue;
		this.createAnimationFunction = fn;

        $effect(() => {
            const newValue = this.value;
            untrack(() => {
                this.animateDisplayValue(newValue);
                this.oldValue = this.value           
            });
        });
	}

	// Cast-free default for the common case:
	static withBasicTween(initial = 0, initialParams: TBasedAnimationParams = {duration: 1000}) {
		return new AnimatingValue<TweenAnimationParams>(
			initial,
			(vc) => createValueTweenAnimation(vc, initialParams)
		);
	}

	// Generic constructor when you provide your own factory:
	static with<T extends TBasedAnimationParams>(initial = 0, fn: CreateAnimationFn<T>) {
		return new AnimatingValue<T>(initial, fn);
	}

    public animateDisplayValue(newValue: number) {
        this.#currentAnimationControl?.stop();
        
        const {ctl, params} = this.createAnimationFunction({
                oldvalue: this.oldValue, 
                newValue, 
                currentDisplayValue: this.displayValue, 
                oldCtl: this.#currentAnimationControl,
                updateValue: (v) => this.displayValue = floorTo(v, this.digitsAfterDec)
            });

        this.#currentAnimationControl = ctl;
        
        this.#currentAnimationControl.start(params);
    }
}