import { useCallback } from 'react';
import { useStore } from './useStore';

const useThemeSwitcher = () => {
    const { ui } = useStore() ?? {
        ui: {
            setDarkMode: () => {},
            is_dark_mode_on: false,
        },
    };
    const { setDarkMode, is_dark_mode_on } = ui;

    const toggleTheme = useCallback(() => {
        const body = document.querySelector('body');
        if (!body) return;

        const hasDark = body.classList.contains('theme--dark');

        // Remove all theme classes and switch mode
        body.classList.remove('theme--light', 'theme--dark', 'theme--slate');

        if (hasDark) {
            localStorage.setItem('theme', 'light');
            body.classList.add('theme--light');
            setDarkMode(false);
        } else {
            localStorage.setItem('theme', 'dark');
            body.classList.add('theme--dark');
            setDarkMode(true);
        }
    }, [setDarkMode]);

    return {
        toggleTheme,
        is_dark_mode_on,
        setDarkMode,
    };
};

export default useThemeSwitcher;
