import { THEMES, getThemeByScore } from '../data/themes';

class ThemeService {
  constructor() {
    this.currentTheme = THEMES[0]; // Start with Ocean
    this.listeners = [];
  }

  getThemeForScore(score) {
    return getThemeByScore(score);
  }

  setTheme(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      this.currentTheme = theme;
      this.notifyListeners();
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getAllThemes() {
    return THEMES;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }
}

export default new ThemeService();
