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
/**
 * Builds a Next.js App Router manifest object with reasonable PWA defaults.
 * Every field can be overridden. This helper has no Serwist dependency, so it is
 * safe to import from the main entry point (`app/manifest.ts` in the consumer).
 */
export function createManifest(options) {
    const { name, short_name = name, theme_color = '#000000', background_color, icon_path = '/favicon', icons } = options, rest = __rest(options, ["name", "short_name", "theme_color", "background_color", "icon_path", "icons"]);
    return Object.assign({ name,
        short_name, start_url: '/', display: 'standalone', orientation: 'portrait', theme_color, background_color: background_color !== null && background_color !== void 0 ? background_color : theme_color, icons: icons !== null && icons !== void 0 ? icons : [
            {
                src: `${icon_path}/android-chrome-192x192.png`,
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: `${icon_path}/android-chrome-512x512.png`,
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: `${icon_path}/android-chrome-maskable-512x512.png`,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ] }, rest);
}
export default createManifest;
