import type { MetadataRoute } from 'next';
type Manifest = MetadataRoute.Manifest;
export interface CreateManifestOptions extends Partial<Manifest> {
    /** App name shown on install prompts. */
    name: string;
    /** Short name for the home screen. Defaults to `name`. */
    short_name?: string;
    /** Primary brand color. Default: `#000000`. */
    theme_color?: string;
    /** Splash background color. Defaults to `theme_color`. */
    background_color?: string;
    /**
     * Base path for the default icon set. Icons are expected at
     * `${icon_path}/android-chrome-192x192.png`, `-512x512.png` and
     * `-maskable-512x512.png`. Default: `/favicon`.
     */
    icon_path?: string;
}
/**
 * Builds a Next.js App Router manifest object with reasonable PWA defaults.
 * Every field can be overridden. This helper has no Serwist dependency, so it is
 * safe to import from the main entry point (`app/manifest.ts` in the consumer).
 */
export declare function createManifest(options: CreateManifestOptions): Manifest;
export default createManifest;
