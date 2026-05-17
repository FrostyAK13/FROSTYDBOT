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

        // Get current theme
        const hasSlate = body.classList.contains('theme--slate');
        const hasDark = body.classList.contains('theme--dark');

        // Remove all theme classes
        body.classList.remove('theme--light', 'theme--dark', 'theme--slate');

        if (hasSlate || hasDark) {
            // Switch to light theme
            localStorage.setItem('theme', 'light');
            body.classList.add('theme--light');
            setDarkMode(false);
        } else {
            // Switch to slate theme (deep dark)
            localStorage.setItem('theme', 'slate');
            body.classList.add('theme--slate');
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
