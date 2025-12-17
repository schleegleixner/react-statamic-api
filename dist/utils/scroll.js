export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};
/**
 * Smoothly scrolls to a given element by its ID and adjusts the position.
 * @param elementId The ID of the element to scroll to.
 * @param offset Additional offset to adjust the final scroll position (default: 0).
 */
export const scrollToElement = (elementId = 'content', offset = null, onlyIfBelow = false) => {
    var _a;
    const element = document.getElementById(elementId);
    if (onlyIfBelow) {
        const elementTop = (_a = element === null || element === void 0 ? void 0 : element.getBoundingClientRect().top) !== null && _a !== void 0 ? _a : 0;
        if (elementTop < 0) {
            return;
        }
    }
    if (offset === null) {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            offset = navbar.clientHeight * -1;
        }
    }
    if (element) {
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementTop + (offset !== null && offset !== void 0 ? offset : 0),
            behavior: 'smooth',
        });
    }
};
