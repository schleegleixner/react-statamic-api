import { PageMappingType } from '../types';
export declare function findPageByIdOrSlug(sitemap: PageMappingType[], identifier: string): PageMappingType | null;
export declare function getCurrentPageServer(sitemap: PageMappingType[], pathname: string, enforce_matching_url?: boolean): Promise<PageMappingType | undefined>;
export declare function getPageTitleServer(pathname: string, site_id: string, page: PageMappingType | undefined, seo_title: string | null, divider?: string, default_page_title?: string): Promise<string>;
export declare function getPageTitle(title: string, seo_title?: string | null): Promise<string>;
export declare function setPageTitle(title: string, seo_title?: string | null): Promise<boolean>;
export declare function getTileTitle(tile: any): string;
