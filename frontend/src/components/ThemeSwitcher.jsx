import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-primary/5 text-primary hover:bg-primary/10 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95 flex items-center justify-center border-none cursor-pointer"
      title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <span className="material-symbols-outlined">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

export default ThemeSwitcher;