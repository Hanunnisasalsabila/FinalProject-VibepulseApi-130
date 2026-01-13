/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Theme Color Palette
        midnight: {
          50: '#e9d5ff',
          100: '#ddd6fe',
          200: '#c4b5fd',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#1a1033',
          950: '#0f172a',
        },
        
        // Primary Purple Palette
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        
        // Secondary Pink Palette
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },

        // Lavender Accent
        lavender: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },

        // Moon Yellow (for glow effects)
        moon: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },

      backgroundImage: {
        // Gradient Backgrounds - Midnight Theme
        'gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-night': 'linear-gradient(to bottom, #1a1033 0%, #0f172a 50%, #020617 100%)',
        'gradient-purple-pink': 'linear-gradient(135deg, #c084fc 0%, #e879f9 100%)',
        'gradient-midnight': 'linear-gradient(to bottom right, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        
        // Text Gradients
        'gradient-text': 'linear-gradient(to right, #c4b5fd, #f0abfc, #c4b5fd)',
        'gradient-shine': 'linear-gradient(135deg, #ffffff 0%, #c084fc 50%, #ffffff 100%)',
      },

      animation: {
        // Existing animations enhanced
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        
        // New midnight theme animations
        'float': 'float 3s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-reverse': 'spin-reverse 1.5s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'sound-bar': 'sound-bar 0.8s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
        'spin-vinyl': 'spin-vinyl 3s linear infinite',
        'aurora': 'aurora 15s ease-in-out infinite',
        'float-particle': 'float-particle 2s ease-in-out infinite',
      },

      keyframes: {
        // Existing keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        // New midnight theme keyframes
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'sound-bar': {
          '0%, 100%': { height: '40px' },
          '50%': { height: '100px' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'spin-vinyl': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        aurora: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(50%) translateY(-20px)' },
        },
        'float-particle': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
      },

      // Custom spacing for midnight theme
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Custom blur values
      blur: {
        xs: '2px',
        '3xl': '64px',
        '4xl': '128px',
      },

      // Custom shadow values
      boxShadow: {
        'purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'purple-lg': '0 0 40px rgba(139, 92, 246, 0.6)',
        'pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'pink-lg': '0 0 40px rgba(236, 72, 153, 0.6)',
        'glow': '0 0 30px rgba(192, 132, 252, 0.4)',
        'glow-lg': '0 0 60px rgba(192, 132, 252, 0.6)',
      },

      // Custom backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Custom font sizes
      fontSize: {
        '2xs': '0.625rem',
      },

      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Custom transition duration
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [],
}