import { NavigationType } from '../types';
export default function useNavigation<T = NavigationType>(handle?: string, site_id?: string): {
    navigation: T | null;
    is_loading: boolean;
    has_error: boolean;
};
