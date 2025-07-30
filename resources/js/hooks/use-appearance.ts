export function initializeTheme() {
    // Force light theme only
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
}

export function useAppearance() {
    const setTheme = () => {
        // Always set to light theme
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    };

    const getCurrentTheme = (): 'light' => {
        return 'light';
    };

    return {
        setTheme,
        getCurrentTheme,
    };
}
