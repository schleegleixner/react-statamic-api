export declare const axisMinimum: (axisValues: {
    min: number;
    max: number;
}) => number;
export declare const axisFormatter: (value: number | string) => string;
export declare const calculateTrendline: (data: [string, number][]) => [number, number][];
