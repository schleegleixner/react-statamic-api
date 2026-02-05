var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NextResponse } from 'next/server';
export default function responseAuth(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const { password } = yield req.json();
        const host = req.headers.get('host') || 'localhost:3000';
        const is_secure = !host.includes('localhost') && !host.includes('127.0.0.1');
        const is_iframe = req.headers.get('Sec-Fetch-Dest') === 'iframe';
        const is_insecure_iframe = is_iframe && !is_secure;
        if (password === process.env.PASSWORD) {
            const response = NextResponse.json({
                success: true,
                skipCookie: is_insecure_iframe // skip it
            });
            // set cookie only if it works
            if (!is_insecure_iframe) {
                response.cookies.set('site_auth', password, {
                    path: '/',
                    httpOnly: true,
                    secure: is_secure,
                    sameSite: is_secure ? 'none' : 'lax',
                    maxAge: 60 * 60 * 24 * 7,
                });
            }
            return response;
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    });
}
