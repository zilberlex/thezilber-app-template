import type { AnimationControl } from "$lib/engine/animation/animation-control";
import { tweenValue, type TBasedAnimationParams, type TweenAnimationParams } from "$lib/engine/animation/tweens";
import type { ValueChangeAnimationInput } from "./animating-number.svelte";

export function createValueTweenAnimation(changingValueAnimationInput: ValueChangeAnimationInput,
                                          initialParams: TBasedAnimationParams = {duration: 1000}
                                         ): { ctl: AnimationControl<TweenAnimationParams>, 
                                              params: Partial<TweenAnimationParams>} {
    const { newValue, currentDisplayValue, oldCtl, updateValue} = changingValueAnimationInput;

    const ctl = oldCtl ?? tweenValue(v => updateValue(v), { from: 0, to: 0, ...initialParams });

    const params = {
        from: currentDisplayValue,
        to: newValue
    }
    
    return { ctl, params }
}
