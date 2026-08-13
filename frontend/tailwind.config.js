/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // SENN Design System Colors (Material 3 Adaptive Scheme) - Updated with approved palette
        "primary": "#043F3B",
        "on-primary": "#ffffff",
        "primary-container": "#2F6E63",
        "on-primary-container": "#FCF9F0",
        "inverse-primary": "#53A599",
        
        "secondary": "#2F6E63",
        "on-secondary": "#ffffff",
        "secondary-container": "#53A599",
        "on-secondary-container": "#043F3B",
        
        "tertiary": "#3c2300",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5a3700",
        "on-tertiary-container": "#ec9700",
        
        "background": "#FCF9F0",
        "on-background": "#2C2B27",
        
        "surface": "#FCF9F0",
        "surface-dim": "#97A29C",
        "surface-bright": "#FCF9F0",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3eb",
        "surface-container": "#f1eee6",
        "surface-container-high": "#ebe8e0",
        "surface-container-highest": "#e5e2da",
        "on-surface": "#2C2B27",
        "on-surface-variant": "#97A29C",
        "inverse-surface": "#31312b",
        "inverse-on-surface": "#f4f0e8",
        
        "outline": "#97A29C",
        "outline-variant": "#97A29C",
        "surface-tint": "#53A599",
        
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        
        // Legacy background colors mapped to the new SENN Design System colors
        "background-light": "#FCF9F0",
        "background-dark": "#120F1A",
      },
      fontFamily: {
        "display": ["Outfit", "sans-serif"],
        "sans": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "sm": "0.25rem",
        "DEFAULT": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "16px",
        "section-gap": "48px",
      }
    },
  },
  plugins: [],
}
