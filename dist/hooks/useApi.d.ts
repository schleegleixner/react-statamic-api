export default function useApi<T>(route: string, lifetime?: number, auto_update?: boolean): {
    data: T | null;
    status: "success" | "error" | "loading" | "idle";
};
