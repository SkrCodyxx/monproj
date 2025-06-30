/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all relevant files in src
  ],
  theme: {
    extend: {
      colors: {
        // Define custom Haitian-inspired palette
        'brand-orange': {
          light: '#FFC9A3', // Lighter shade of orange
          DEFAULT: '#FF8C00', // Main orange (adjust as needed, DarkOrange)
          dark: '#CC7000',   // Darker shade of orange
        },
        'brand-green': {
          light: '#A3D9A5', // Lighter shade of green
          DEFAULT: '#008000', // Main green (adjust as needed, Green)
          dark: '#006400',   // Darker shade of green
        },
        // Add other brand colors or utility colors
        'brand-blue': '#0077B6', // Example accent blue
        'brand-red': '#D7263D',  // Example accent red (for errors or highlights)
        'neutral-gray': {
          light: '#F5F5F5',
          DEFAULT: '#E0E0E0',
          dark: '#757575',
          darker: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      // Extend other properties like spacing, borderRadius, etc.
      // Example for animations (if using Tailwind for simple transitions)
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      // Keyframes for Framer Motion or custom animations (if needed directly in Tailwind)
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0'},
          '100%': { transform: 'translateY(0)', opacity: '1'},
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s ease-out forwards',
      }
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // If you want to use Tailwind's form styling plugin
    // require('@tailwindcss/typography'), // For styling markdown-generated content
  ],
}
