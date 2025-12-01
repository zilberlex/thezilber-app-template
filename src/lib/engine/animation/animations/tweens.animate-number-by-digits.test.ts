import { __test__ } from "./animate-number-by-digits";

// Testing
//
// let [from, to] = [9900, -100];
// let [from, to] = [10, -15];
// let [from, to] = [-255, -242];
// let [from, to] = [242,253];
// let [from, to] = [1225, 1225];


let [from, to] = [0, 9999];
// let [from, to] = [990, 1012];

let ranges = __test__.makeMapRangesTicksBased(from, to);
console.log('for', from, '-', to);
console.log(ranges);

// let diff = indexOfMsdDiff(from, to);
// console.log('diff', diff);

// let anim = animateNumberByDigits((v) => console.log(v), { from: from, to: to, duration: 500 });
// anim.start();
