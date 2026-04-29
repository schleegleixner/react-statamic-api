export type NavigationItemType = {
    id: string;
    slug: string;
    title: string;
    aria_label: string;
    target: string;
    full_url: string;
    active: boolean;
    children: NavigationItemType[];
};
export type NavigationType = {
    handle: string;
    title: string | null;
    items: NavigationItemType[];
};
