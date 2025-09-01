import { createAnimationControl, type AnimationControl } from "$lib/engine/animation/animation-control";
import { floorTo } from "$lib/engine/animation/math-utils";
import { tweenAnimate } from "$lib/engine/animation/tweens";
import { untrack } from "svelte";

export class AnimatingValue {
	value: number = $state(0);
	displayValue: number = $state(0);
    numberAfterDec: number = $state(0);

    #lastTimeout?: number;

    #lastAnimationControl?: AnimationControl;

    constructor(initial?: number) {
        this.value = initial ?? 0;

        $effect(() => {
            console.log('animating value', this.value);

            untrack(() => this.animateDisplayValue(this.value));
        });
    }

    public animateDisplayValue(value: number) {
        this.#lastAnimationControl?.stop();
        
        const old = this.displayValue;

        const animationControl = tweenAnimate({from: old, to: value, duration: 300},
                                              v => this.displayValue = floorTo(v, this.numberAfterDec));

        animationControl.start();
        this.#lastAnimationControl = animationControl;
    }
}
