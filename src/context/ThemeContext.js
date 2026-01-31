import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';
import { getThemeByScore, getThemeById } from '../data/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getThemeById('ocean'));
    const [isAutoTheme, setIsAutoTheme] = useState(true);
    const [selectedThemeId, setSelectedThemeId] = useState('ocean');

    const refreshTheme = useCallback(async () => {
        try {
            const [bestScore, selectedId, isAuto] = await Promise.all([
                StorageService.getBestScore(),
                StorageService.getSelectedTheme(),
                StorageService.getAutoTheme()
            ]);

            const currentId = selectedId || 'ocean';
            const autoEnabled = isAuto;

            const newTheme = autoEnabled
                ? getThemeByScore(bestScore)
                : getThemeById(currentId);

            setTheme(newTheme);
            setIsAutoTheme(autoEnabled);
            setSelectedThemeId(currentId);
        } catch (error) {
            console.error('Error refreshing theme in provider:', error);
        }
    }, []);

    useEffect(() => {
        refreshTheme();
    }, [refreshTheme]);

    return (
        <ThemeContext.Provider value={{ theme, isAutoTheme, selectedThemeId, refreshTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useAppTheme must be used within a ThemeProvider');
    }
    return context;
};
