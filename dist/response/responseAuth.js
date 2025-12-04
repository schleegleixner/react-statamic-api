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
        if (password === process.env.PASSWORD) {
            const response = new NextResponse(JSON.stringify({ success: true }), {
                status: 200,
            });
            response.cookies.set('site_auth', password, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
            return response;
        }
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
        });
    });
}
