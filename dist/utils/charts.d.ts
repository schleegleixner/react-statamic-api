import { InputDataType } from '../types/tiles';
export declare const axisMinimum: (axisValues: {
    min: number;
    max: number;
}) => number;
export declare const axisFormatter: (value: number | string) => string;
export declare const calculateTrendline: (data: [string, number][]) => [number, number][];
export declare const getSplitSeries: (data: InputDataType[], property: keyof InputDataType, split_future?: boolean) => {
    past_and_present: [number, number | null][];
    future: {
        value: [number, number | null];
        symbolSize: number;
    }[];
};
