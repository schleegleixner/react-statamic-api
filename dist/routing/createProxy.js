import { NextResponse } from 'next/server';
import { isAuthenticated } from '../utils/';
export default function createProxy(config = {}) {
    var _a, _b;
    const valid_site_ids = ((_a = config.siteIds) === null || _a === void 0 ? void 0 : _a.slice()) || ((_b = process.env.SITE_IDS) === null || _b === void 0 ? void 0 : _b.split(',')) || [];
    const default_site_id = config.defaultSiteId || process.env.DEFAULT_SITE_ID || valid_site_ids[0] || 'default';
    const password_env = config.password || process.env.PASSWORD || '';
    const default_index = valid_site_ids.indexOf(default_site_id);
    if (default_index > -1) {
        valid_site_ids.splice(default_index, 1);
    }
    valid_site_ids.push('preview');
    return function proxy(request) {
        var _a, _b;
        const { pathname, search } = request.nextUrl;
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const is_secure = protocol === 'https';
        const is_iframe = request.headers.get('Sec-Fetch-Dest') === 'iframe';
        if (pathname.includes('.')) {
            return NextResponse.next();
        }
        if (pathname.startsWith('/api')) {
            console.log('🚨 API request landed in proxy:', pathname);
            return NextResponse.next();
        }
        const url = request.nextUrl.clone();
        const password = url.searchParams.get('password');
        const existing_auth = (_a = request.cookies.get('site_auth')) === null || _a === void 0 ? void 0 : _a.value;
        const auth_value = password || existing_auth || '';
        const is_insecure_iframe = is_iframe && !is_secure;
        if (password && password === password_env && !is_insecure_iframe) {
            url.searchParams.delete('password');
            const response = NextResponse.redirect(url);
            response.cookies.set('site_auth', password, {
                path: '/',
                httpOnly: true,
                secure: is_secure,
                sameSite: is_secure ? 'none' : 'lax',
                maxAge: 60 * 60 * 24 * 7,
            });
            return response;
        }
        let response;
        let site_id = default_site_id;
        const matched_site_id = valid_site_ids.find(s => pathname.startsWith(`/${s}/`) || pathname === `/${s}`);
        if (matched_site_id) {
            site_id = matched_site_id;
            response = NextResponse.next();
        }
        else {
            const rewrite_url = new URL(`/${default_site_id}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url);
            response = NextResponse.rewrite(rewrite_url);
        }
        const full_url = `${protocol}://${host}${pathname}${search}`;
        response.headers.set('x-full-url', full_url);
        response.headers.set('x-pathname', pathname);
        response.headers.set('x-site-id', site_id);
        response.headers.set('x-site-auth', isAuthenticated(auth_value, site_id) ? 'true' : 'false');
        response.headers.delete('X-Frame-Options');
        response.headers.set('Content-Security-Policy', 'frame-ancestors *;');
        if (pathname.includes('/api')) {
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
            response.headers.set('Access-Control-Allow-Headers', (_b = request.headers.get('Access-Control-Request-Headers')) !== null && _b !== void 0 ? _b : 'Content-Type');
            response.headers.set('locale', site_id);
        }
        return response;
    };
}
