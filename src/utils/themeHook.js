import { useAppTheme as useThemeContext } from '../context/ThemeContext';

/**
 * Compatibility hook that redirects to the global ThemeContext.
 * This ensures all screens stay in sync instantly when any screen updates the theme.
 */
export const useAppTheme = () => {
    return useThemeContext();
};
