'use client';
import React, { useEffect } from 'react';
import { normalizeTranslations, setSiteId, setTranslations, } from '../utils/translation';
export default function TranslationContext({ children, strings, site_id, }) {
    useEffect(() => {
        setTranslations(normalizeTranslations(strings));
        if (site_id) {
            setSiteId(site_id);
        }
    }, [strings, site_id]);
    return React.createElement(React.Fragment, null, children);
}
