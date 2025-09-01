import { createAnimationControl, type AnimationCallback, type AnimationControl } from "./animation-control";
import { lerp } from "./math-utils";

type TweenAnimation = (val: number) => void;
type TweenAnimationParams = {from: number, to: number, duration: number};

export function tweenAnimate(params: TweenAnimationParams, 
                             animation: TweenAnimation): AnimationControl {
    const {from, to, duration} = params;

    return createAnimationControl(tBasedAnimationControl(duration, (t: number) => {
                                        const val = lerp(from, to, t);
                                        animation(val);
                                    }));
}



function tBasedAnimationControl(duration: number, animation: (t:number) => void): AnimationCallback {
    return (_: number, elapsed: number) => {
        const t = Math.min(elapsed / duration, 1);
        animation(t);
        return t < 1;
    };
}

