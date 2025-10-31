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
import { useEffect, useState } from 'react';
import { getTileset } from '../lib';
export default function useTileset(site_id = 'default') {
    const [collection, setCollection] = useState(null);
    const [is_loading, setIsLoading] = useState(false);
    const [has_error, setHasError] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
        const fetchData = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const tileset = yield getTileset(site_id);
                setCollection(tileset);
            }
            catch (err) {
                console.error(err);
                setHasError(true);
            }
            finally {
                setIsLoading(false);
            }
        });
        fetchData();
    }, [site_id]);
    return { collection, is_loading, has_error };
}
