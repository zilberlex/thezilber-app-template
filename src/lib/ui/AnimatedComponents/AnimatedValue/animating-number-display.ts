export function createPaddingDisplay(padChar: '0' | '*' = '0') {
    return (currentValue: number, endValue: number) => currentValue.toString().padStart(endValue.toString().length, padChar);
}