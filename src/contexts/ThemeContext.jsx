import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "minimalism";
  });
  
  const [uiScale, setUiScale] = useState(() => {
    return parseFloat(localStorage.getItem("app_ui_scale")) || 1;
  });

  const [fontScale, setFontScale] = useState(() => {
    return parseFloat(localStorage.getItem("app_font_scale")) || 1;
  });

  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("app_ui_scale", uiScale);
    localStorage.setItem("app_font_scale", fontScale);
    document.documentElement.style.setProperty('--ui-scale', uiScale);
    document.documentElement.style.setProperty('--font-scale', fontScale);
  }, [uiScale, fontScale]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, uiScale, setUiScale, fontScale, setFontScale }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
