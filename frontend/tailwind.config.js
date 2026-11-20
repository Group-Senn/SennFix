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
        // Paleta SENN "credencial de oficio": Monte (marca), Superficie mineral, Casco (acento)
        "primary": "#043F3B",
        "on-primary": "#ffffff",
        "primary-container": "#2F6E63",
        "on-primary-container": "#F4F6F3",
        "inverse-primary": "#53A599",
        
        "secondary": "#2F6E63",
        "on-secondary": "#ffffff",
        "secondary-container": "#53A599",
        "on-secondary-container": "#043F3B",
        
        "tertiary": "#3c2300",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5a3700",
        "on-tertiary-container": "#ec9700",
        
        "background": "#F4F6F3",
        "on-background": "#17201D",
        
        "surface": "#F4F6F3",
        "surface-dim": "#97A29C",
        "surface-bright": "#F4F6F3",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#EEF2EF",
        "surface-container": "#E8EDE9",
        "surface-container-high": "#E1E7E3",
        "surface-container-highest": "#DAE1DC",
        "on-surface": "#17201D",
        // Texto secundario sólido: 6.0:1 sobre la superficie (antes #97A29C, 2.6:1)
        "on-surface-variant": "#52615C",
        "inverse-surface": "#1F2C26",
        "inverse-on-surface": "#E8EEEB",
        
        "outline": "#97A29C",
        "outline-variant": "#97A29C",
        "surface-tint": "#53A599",
        
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        
        // Legacy background colors mapped to the new SENN Design System colors
        "background-light": "#F4F6F3",
        "background-dark": "#0F1614",

        // Texto principal y secundario. "muted" cambia sola en modo oscuro (variable en index.css)
        "ink": "#17201D",
        "muted": "rgb(var(--color-muted) / <alpha-value>)",
        // Amarillo casco: único acento, solo para "disponible ahora" y la acción principal (texto Monte encima: 6.4:1)
        "casco": "#F2B33D",
        "available": "#1A7F4B",

        // Grises con matiz mineral (verdoso) en lugar del slate azulado: misma luminosidad, mismos contrastes.
        // Incluye 350/450/455/650/750/850, que el código ya usaba y antes no existían.
        "slate": {
          50: "#F8FBF9", 100: "#F1F6F3", 200: "#E0EAE5", 300: "#C9D8D1", 350: "#AFBFB7",
          400: "#96A69E", 450: "#7B8982", 455: "#7B8982", 500: "#616D67", 600: "#495851",
          650: "#3F4E47", 700: "#36443D", 750: "#2A3831", 800: "#1F2C26", 850: "#16231D",
          900: "#0E1B15", 950: "#010A05",
        },
        // Verde monte (matiz del logo) en lugar del teal neón
        "teal": {
          50: "#F2FCFB", 100: "#D4F8F4", 200: "#ACF1E9", 300: "#82E4DA", 350: "#72D9CF",
          400: "#63CEC4", 450: "#54C1B7", 455: "#54C1B7", 500: "#51B2AA", 600: "#418F88",
          700: "#35726D", 750: "#306662", 800: "#2B5B57", 900: "#254C48", 950: "#122E2B",
        },
        // green-600 por defecto da 3.3:1 en blanco (fallaba en los requisitos de contraseña)
        "green": { 600: "#1A7F4B" },
      },
      fontFamily: {
        "display": ["Outfit", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
        "handwriting": ["Caveat", "cursive"]
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
