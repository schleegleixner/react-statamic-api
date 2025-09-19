'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCacheEndpoint } from '../utils/api';
import { useEffect, useRef, useState } from 'react';
const fetchData = (file_name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const endpoint = getCacheEndpoint('source');
        const response = yield fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file_name }),
        });
        if (!response.ok) {
            return false;
        }
        const payload = yield response.json();
        return payload || false;
    }
    catch (error) {
        console.error('Error fetching file:', file_name, error);
        return false;
    }
});
export function useSourceFile(file_name) {
    const [data, setData] = useState([]);
    const isFetching = useRef(false);
    useEffect(() => {
        if (isFetching.current) {
            return;
        }
        isFetching.current = true;
        fetchData(file_name)
            .then(result => {
            if (result) {
                setData(result);
            }
        })
            .catch(error => {
            console.error(`Error fetching file: ${file_name}`, error);
        })
            .finally(() => {
            isFetching.current = false;
        });
    }, [file_name]);
    return data;
}
