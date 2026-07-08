var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import withSerwistInit from '@serwist/next';
/**
 * Wraps a Next.js config with a sensible Serwist setup so consumers only need a
 * single call. Existing config is preserved. PWA-only, safe to omit for
 * non-PWA projects (this module is exposed via the `./pwa/next` subpath and is
 * never pulled into the main entry point).
 */
export default function withPWA(nextConfig = {}, options = {}) {
    const { swSrc = 'app/sw.ts', swDest = 'public/sw.js', disable = process.env.NODE_ENV === 'development', register = true, cacheOnNavigation = true, reloadOnOnline = true } = options, rest = __rest(options, ["swSrc", "swDest", "disable", "register", "cacheOnNavigation", "reloadOnOnline"]);
    const withSerwist = withSerwistInit(Object.assign({ swSrc,
        swDest,
        disable,
        register,
        cacheOnNavigation,
        reloadOnOnline }, rest));
    return withSerwist(nextConfig);
}
