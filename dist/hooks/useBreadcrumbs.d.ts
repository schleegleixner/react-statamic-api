import { BreadcrumbType } from '../types';
export default function useBreadcrumbs(site_id: string, sitemap: any[], tilemap?: {
    tile_id: string;
    title: string | null;
}[] | null, title404?: string): BreadcrumbType[];
