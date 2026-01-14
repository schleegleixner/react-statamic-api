interface UseSearchOptions {
    paramKey?: string;
    minLength?: number;
    maxLength?: number;
}
interface UseSearchReturn {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    clearSearch: () => void;
    isValidSearch: boolean;
}
export default function useSearch(options?: UseSearchOptions): UseSearchReturn;
export declare const updateSearchQueryString: (value: string | null, key?: string) => void;
export declare const clearSearchQueryString: (key?: string) => void;
export declare const getSearchQuery: (searchParams: URLSearchParams | null, key?: string) => string | null;
export {};
