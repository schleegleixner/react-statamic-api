export default function useContentWidth<T extends HTMLElement = HTMLDivElement>(): {
    elRef: import("react").RefObject<T | null>;
    contentWidth: number;
};
