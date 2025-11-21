import { RefObject } from 'react';
export default function useContentWidth<T extends HTMLElement = HTMLDivElement>(): {
    el_ref: RefObject<T>;
    content_width: number;
};
