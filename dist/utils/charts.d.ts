import { InputDataType } from '../types/tiles';
import type { SeriesOption } from 'echarts';
export declare const getSplitSeries: (data: InputDataType[], property: keyof InputDataType, split_future?: boolean) => {
    past_and_present: [number, number | null][];
    future: {
        value: [number, number | null];
        symbolSize: number;
    }[];
};
export declare const categorizeSeriesData: (series: SeriesOption[], timeline: number[]) => SeriesOption[];
export declare const axisMinimum: (axisValues: {
    min: number;
    max: number;
}) => number;
export declare const axisFormatter: (value: number | string) => string;
export declare const getFullTimeline: (startYear: number, endYear: number) => number[];
export declare const getTimelineFromSeries: (series: SeriesOption[], fill_gaps?: boolean) => number[];
