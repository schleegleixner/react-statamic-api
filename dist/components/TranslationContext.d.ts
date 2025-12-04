import React, { ReactNode } from 'react';
export default function TranslationContext({ children, strings, site_id, }: {
    children: ReactNode;
    strings: Array<{
        key: string;
        value: string;
    }>;
    site_id?: string;
}): React.JSX.Element;
