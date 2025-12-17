export declare const scrollToTop: () => void;
/**
 * Smoothly scrolls to a given element by its ID and adjusts the position.
 * @param elementId The ID of the element to scroll to.
 * @param offset Additional offset to adjust the final scroll position (default: 0).
 */
export declare const scrollToElement: (elementId?: string, offset?: number | null, onlyIfBelow?: boolean) => void;
