/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488'
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b'
        },
        coral: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48'
        },
        ink: {
          800: '#111827',
          900: '#0b1120',
          950: '#060a14'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px -8px rgba(15, 23, 42, 0.12)',
        lift: '0 12px 40px -12px rgba(79, 70, 229, 0.35)',
        float: '0 24px 60px -20px rgba(15, 23, 42, 0.35)',
        ring: '0 0 0 1px rgba(15, 23, 42, 0.05)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'flip-in': {
          '0%': { opacity: '0', transform: 'rotateY(-90deg) scale(0.9)' },
          '100%': { opacity: '1', transform: 'rotateY(0) scale(1)' }
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' }
        },
        'beam-glow': {
          '0%, 100%': { opacity: '0.45', transform: 'scaleY(0.85)' },
          '50%': { opacity: '1', transform: 'scaleY(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'token-pop': {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.22)' },
          '100%': { transform: 'scale(1.1)' }
        },
        'score-bump': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)', color: '#0d9488' },
          '100%': { transform: 'scale(1)' }
        },
        'flip-card': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        },
        'drop-in': {
          '0%': { opacity: '0', transform: 'translateY(-18px) scale(0.92)' },
          '70%': { transform: 'translateY(3px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'chip-drop': {
          '0%': { opacity: '0', transform: 'translate3d(0, -70px, 90px) scale(1.35) rotate(-12deg)' },
          '55%': { opacity: '1', transform: 'translate3d(0, 5px, 0) scale(0.93) rotate(3deg)' },
          '75%': { transform: 'translate3d(0, -3px, 6px) scale(1.04) rotate(-1deg)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' }
        },
        'chip-idle': {
          '0%, 100%': { transform: 'translateZ(14px)' },
          '50%': { transform: 'translateZ(20px)' }
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-3px)' },
          '40%, 60%': { transform: 'translateX(3px)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'flip-in': 'flip-in 0.45s ease-out both',
        pop: 'pop 0.4s ease-out both',
        'scale-in': 'scale-in 0.16s ease-out both',
        'slide-in-right': 'slide-in-right 0.24s ease-out both',
        'slide-in-left': 'slide-in-left 0.22s ease-out both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'beam-glow': 'beam-glow 1.4s ease-in-out infinite',
        float: 'float 3.2s ease-in-out infinite',
        'token-pop': 'token-pop 0.32s ease-out both',
        'score-bump': 'score-bump 0.6s ease-out',
        'drop-in': 'drop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'chip-drop': 'chip-drop 0.75s cubic-bezier(0.34, 1.3, 0.5, 1) both',
        'chip-idle': 'chip-idle 3.4s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out both'
      }
    }
  },
  plugins: []
}
