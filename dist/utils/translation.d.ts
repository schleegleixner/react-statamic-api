type Translations = Record<string, string>;
export declare const setTranslations: (translations: Translations) => void;
export declare const setSiteId: (site_id: string) => void;
export declare const getGlobalString: (key: string, fallback?: string) => string;
export declare const getSiteId: () => string;
export declare const normalizeTranslations: (entries: Array<{
    key: string;
    value: string;
}>) => Record<string, string>;
export {};
