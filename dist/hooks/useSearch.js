'use client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
const DEFAULT_SEARCH_PARAM = 'suche';
const MIN_SEARCH_LENGTH = 3;
const MAX_SEARCH_LENGTH = 128;
const updateQueryString = (key, value) => {
    const url = new URL(window.location.href);
    if (value) {
        url.searchParams.set(key, value);
    }
    else {
        url.searchParams.delete(key);
    }
    window.history.pushState({}, '', url.toString());
};
export default function useSearch(options = {}) {
    const { paramKey = DEFAULT_SEARCH_PARAM, minLength = MIN_SEARCH_LENGTH, maxLength = MAX_SEARCH_LENGTH, } = options;
    const [searchTerm, setSearchTermState] = useState('');
    const [initialized, setInitialized] = useState(false);
    const searchParams = useSearchParams();
    const searchQuery = (searchParams === null || searchParams === void 0 ? void 0 : searchParams.get(paramKey)) || null;
    const isValidSearch = searchTerm.length >= minLength && searchTerm.length <= maxLength;
    // Initialisierung aus URL
    useEffect(() => {
        if (searchQuery) {
            setSearchTermState(searchQuery);
        }
        setInitialized(true);
    }, [searchQuery]);
    // URL-Synchronisation
    useEffect(() => {
        if (!initialized) {
            return;
        }
        if (isValidSearch) {
            updateQueryString(paramKey, searchTerm);
        }
        else {
            updateQueryString(paramKey, null);
        }
    }, [searchTerm, initialized, isValidSearch, paramKey]);
    const setSearchTerm = useCallback((value) => {
        setSearchTermState(value);
    }, []);
    const clearSearch = useCallback(() => {
        setSearchTermState('');
        updateQueryString(paramKey, null);
    }, [paramKey]);
    return {
        searchTerm,
        setSearchTerm,
        clearSearch,
        isValidSearch,
    };
}
export const updateSearchQueryString = (value, key = DEFAULT_SEARCH_PARAM) => {
    updateQueryString(key, value);
};
export const clearSearchQueryString = (key = DEFAULT_SEARCH_PARAM) => {
    updateQueryString(key, null);
};
export const getSearchQuery = (searchParams, key = DEFAULT_SEARCH_PARAM) => {
    return (searchParams === null || searchParams === void 0 ? void 0 : searchParams.get(key)) || null;
};
