import type { AnimationControl } from "$lib/engine/animation/animation-control";
import { animateNumberByDigits } from "$lib/engine/animation/animations/animate-number-by-digits";
import { type TBasedAnimationParams, type TweenAnimationParams } from "$lib/engine/animation/animations/tweens";
import type { ValueChangeAnimationInput } from "./animating-number.svelte";


// fix this receiving params from outside, this is garbage
export function createValueByDigitsAnimation(changingValueAnimationInput: ValueChangeAnimationInput,
                                             initialParams: TBasedAnimationParams = {duration: 500}
                                         ): { ctl: AnimationControl<TweenAnimationParams>, 
                                              params: Partial<TweenAnimationParams>} {
    
    const { currentDisplayValue, newValue, updateValue } = changingValueAnimationInput;

    const ctl = animateNumberByDigits(v => updateValue(v), { from: currentDisplayValue, to: newValue, ...initialParams });
    
    return { ctl, params: {} }
}
