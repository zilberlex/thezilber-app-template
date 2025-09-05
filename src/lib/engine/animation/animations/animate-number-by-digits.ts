import { indexOfMsdDiff, segmentedRemap, type RangeMaps } from "../math-utils";
import { createTBasedAnimationControl, type TweenAnimationParams, type ValCb } from "./tweens";

function makeMapRangesTicksBased(from: number, to: number): RangeMaps {
    let step = 1;
    let ranges: RangeMaps = [];
    
    let ticksTotal = 0;
    
    if (from === to) {
        return [{fromRange: [0, 1], toRange: [from, from]}];
    }

    const asc = from < to;
    [from, to] = asc ? [from, to] : [to, from];
    
    let currentNum = from;
    // const endPos = Math.floor(Math.log10(to));
    const indexOfDiffStart = indexOfMsdDiff(from, to);
    const endPos = indexOfDiffStart;
    
    // Maps counting to most significat digit
    for (let pos = 0; pos <= endPos; pos++) {
        const curDigit = (currentNum / step) % 10;
        
        let ticksCurrent = 0;
        if (pos !== endPos) {
            ticksCurrent = 10 - curDigit;
        } else {
            ticksCurrent = Math.floor((to / step)) % 10 - curDigit;
        }

        const nextNum = currentNum + (ticksCurrent) * step;
        if (ticksCurrent !== 0) {
            ranges.push({fromRange: [ticksTotal, ticksTotal + ticksCurrent], toRange: [currentNum, nextNum]});
        }
    
        currentNum = nextNum;
        ticksTotal += ticksCurrent;
        step *= 10;
    }

    // Maps counting the rest of digits
    step = 10 ** endPos;
    for (let pos = endPos - 1; pos >= 0; pos--) {
        step /= 10;
        const curDig = (Math.floor(to / step)) % 10;

        const ticksCurrent = curDig;
        
        const nextNum = currentNum + (ticksCurrent) * step;
        
        if (ticksCurrent !== 0) {
            ranges.push({fromRange: [ticksTotal, ticksTotal + ticksCurrent], toRange: [currentNum, nextNum]});
        } 

        ticksTotal += ticksCurrent;

        currentNum = nextNum;
    }

    // Flips ranges in desecnding cases.
    if (!asc) {
        ranges = ranges.map(rangeMap => 
                            ({fromRange: rangeMap.fromRange, 
                            toRange: [rangeMap.toRange[1], rangeMap.toRange[0]]}))
                        .reverse();

        let curFrom = 0;
        for (let i = 0; i < ranges.length; i++) {
            const dTicks = ranges[i].fromRange[1] - ranges[i].fromRange[0];
            
            ranges[i].fromRange = [curFrom, curFrom + dTicks];
            curFrom += dTicks;
        }
    }

    return ranges;
}

export function animateNumberByDigits(valCb: ValCb, initialParams: TweenAnimationParams): AnimationControl<TweenAnimationParams> {
    const {from, to} = initialParams;

    const lerpRanges = makeMapRangesTicksBased(from, to);
    const ticksTotal = lerpRanges[lerpRanges.length - 1].fromRange[1];

    return createTBasedAnimationControl((t, _params) => {
        const tick = t * ticksTotal;
        const tweenedVal = segmentedRemap(lerpRanges, tick);
        
        valCb(tweenedVal);
    }, initialParams);
}

// TODO REMOVE
// 
// let bd = breakDownAmountsPerDigitPos(0, 999);
// breakDownAmountsPerDigitPos(999, 0);
// breakDownAmountsPerDigitPos(1, 999);
// breakDownAmountsPerDigitPos(999, 1);
// breakDownAmountsPerDigitPos(10, 220);
// breakDownAmountsPerDigitPos(10, 223);
// breakDownAmountsPerDigitPos(12, 333);
// breakDownAmountsPerDigitPos(0, 99);
// breakDownAmountsPerDigitPos(1, 99);
// breakDownAmountsPerDigitPos(12, 234);
// breakDownAmountsPerDigitPos(123, 6343);
// let bd = breakDownAmountsPerDigitPos(0, 102);
// let bd = breakDownAmountsPerDigitPos(40, 105);

let [from, to] = [242, 255];
// let [from, to] = [242,253];
// let [from, to] = [1225, 1225];
// let [from, to] = [242, 13];

let ranges = makeMapRangesTicksBased(from, to);
console.log('for', from, '-', to);
console.log(ranges);

// let diff = indexOfMsdDiff(from, to);
// console.log('diff', diff);
