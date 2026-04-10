import React from 'react';
type IconComponent = (props: Record<string, unknown>) => React.ReactElement;
/**
 * Route-handler helper that renders an SVG icon component to a PNG image.
 *
 * Query parameters:
 *  - `size`  – image dimensions in px (default 320, clamped 16–1024)
 *  - `bg`    – background hex colour (default `#37444d`)
 *  - `color` – icon hex colour (default `#ffffff`)
 *
 * @param id       Icon key used to look up the component in `iconMap`.
 * @param req      Incoming request (used to read query parameters).
 * @param sharp    The `sharp` module (passed as peer dependency).
 * @param iconMap  Map of icon keys → React SVG components.
 * @param fallback Optional fallback component when `id` is not found.
 */
export default function responseIcon(id: string, req: Request, sharp: any, iconMap: Record<string, IconComponent>, fallback?: IconComponent): Promise<Response>;
export {};
