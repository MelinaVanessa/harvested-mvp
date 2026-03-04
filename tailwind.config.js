/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        creamy: '#FCFAF7',
        obsidian: '#0D1A15',
        olive: '#4A5D4E',
        silver: '#C29901',
        dusty: '#88887D',
      },
      animation: {
        "in": "in 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in-from-bottom": "slideInFromBottom 0.3s ease-out",
        "slide-in-from-bottom-full": "slideInFromBottomFull 0.3s ease-out",
        "slide-in-from-left": "slideInFromLeft 0.3s ease-out",
        "slide-in-from-right": "slideInFromRight 0.2s ease-out",
        "slide-in-from-top-4": "slideInFromTop 0.3s ease-out",
        "slide-in-from-bottom-4": "slideInFromBottom4 0.4s ease-out",
        "slide-in-from-bottom-8": "slideInFromBottom 0.3s ease-out",
        "slide-in-from-bottom-10": "slideInFromBottom10 0.3s ease-out",
        "slide-in-from-bottom-2": "slideInFromBottom2 0.2s ease-out",
      },
      keyframes: {
        in: { opacity: "1", transform: "translateY(0)" },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideInFromBottom: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        slideInFromBottomFull: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        slideInFromLeft: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        slideInFromRight: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        slideInFromTop: { from: { opacity: "0", transform: "translateY(-0.5rem)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInFromBottom4: { from: { opacity: "0", transform: "translateY(1rem)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInFromBottom10: { from: { transform: "translateY(2.5rem)" }, to: { transform: "translateY(0)" } },
        slideInFromBottom2: { from: { opacity: "0", transform: "translateY(0.5rem)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
}
