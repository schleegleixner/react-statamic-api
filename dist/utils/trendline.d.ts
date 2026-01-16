import type { SeriesOption } from 'echarts';
export declare const calculateTrendline: (data: [string, number][], timeline?: number[]) => [number, number][];
export declare const getTrendlineSeries: (series: SeriesOption[], trendlineStyle: SeriesOption, timeline?: number[]) => SeriesOption;
