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
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getNavigation } from '../lib';
function normalizePath(path) {
    if (!path || path === '/') {
        return '/';
    }
    const [path_without_query] = path.split(/[?#]/);
    return `/${path_without_query.replace(/^\/+|\/+$/g, '')}`;
}
function markActiveItems(items = [], current_path) {
    return items.map(item => {
        var _a;
        const children = markActiveItems((_a = item.children) !== null && _a !== void 0 ? _a : [], current_path);
        const item_path = normalizePath(item.full_url);
        const is_active = item_path === '/'
            ? current_path === '/'
            : current_path === item_path || current_path.startsWith(`${item_path}/`);
        return Object.assign(Object.assign({}, item), { active: is_active || children.some(child => child.active), children });
    });
}
export default function useNavigation(handle = 'main', site_id = 'default') {
    const pathname = usePathname();
    const [navigation, setNavigation] = useState(null);
    const [is_loading, setIsLoading] = useState(false);
    const [has_error, setHasError] = useState(false);
    useEffect(() => {
        let is_active = true;
        setIsLoading(true);
        setHasError(false);
        const fetchData = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield getNavigation(handle, site_id);
                if (is_active) {
                    setNavigation(data);
                }
            }
            catch (err) {
                console.error(err);
                if (is_active) {
                    setNavigation(null);
                    setHasError(true);
                }
            }
            finally {
                if (is_active) {
                    setIsLoading(false);
                }
            }
        });
        fetchData();
        return () => {
            is_active = false;
        };
    }, [handle, site_id]);
    const active_navigation = useMemo(() => {
        if (!navigation) {
            return null;
        }
        return Object.assign(Object.assign({}, navigation), { items: markActiveItems(navigation.items, normalizePath(pathname)) });
    }, [navigation, pathname]);
    return { navigation: active_navigation, is_loading, has_error };
}
