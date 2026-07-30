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
        // SENN Design System Colors (Material 3 Adaptive Scheme)
        "primary": "#002f2d",
        "on-primary": "#ffffff",
        "primary-container": "#004744",
        "on-primary-container": "#7cb4b0",
        "inverse-primary": "#97d1cc",
        
        "secondary": "#006b5f",
        "on-secondary": "#ffffff",
        "secondary-container": "#62fae3",
        "on-secondary-container": "#007165",
        
        "tertiary": "#3c2300",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5a3700",
        "on-tertiary-container": "#ec9700",
        
        "background": "#fcf9f1",
        "on-background": "#1c1c17",
        
        "surface": "#fcf9f1",
        "surface-dim": "#dddad2",
        "surface-bright": "#fcf9f1",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3eb",
        "surface-container": "#f1eee6",
        "surface-container-high": "#ebe8e0",
        "surface-container-highest": "#e5e2da",
        "on-surface": "#1c1c17",
        "on-surface-variant": "#404947",
        "inverse-surface": "#31312b",
        "inverse-on-surface": "#f4f0e8",
        
        "outline": "#707978",
        "outline-variant": "#bfc8c7",
        "surface-tint": "#2e6764",
        
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        
        // Legacy background colors mapped to the new SENN Design System colors
        "background-light": "#fcf9f1",
        "background-dark": "#0f2322",
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
