import { NextRequest, NextResponse } from 'next/server';
export interface ProxyConfig {
    siteIds?: string[];
    defaultSiteId?: string;
    password?: string;
}
export default function createProxy(config?: ProxyConfig): (request: NextRequest) => NextResponse<unknown>;
