export function integerDivision(dividend: number, divisor: number): number {
    return (dividend / divisor) >> 0
}

export function getDateInSeconds(): number {
    return integerDivision(Date.now(), 1000)
}