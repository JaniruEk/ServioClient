// vite.config.js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          animation: {
            'slide-down': 'slideDown 0.5s ease-out',
            'fade-in': 'fadeIn 0.3s ease-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'scale-up': 'scaleUp 0.5s ease-out',
            'slide-left': 'slideLeft 0.5s ease-out',
            'slide-right': 'slideRight 0.5s ease-out',
            'pulse-slow': 'pulseSlow 3s ease-in-out infinite', // Added for button
            'bounce': 'bounce 2s ease-in-out infinite', // Added for scroll indicator
            'pop-up': 'popUp 0.7s ease-out forwards', // Added for pop-up effect
          },
          keyframes: {
            slideDown: {
              '0%': { opacity: '0', transform: 'translateY(-20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            slideUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            scaleUp: {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
            },
            slideLeft: {
              '0%': { opacity: '0', transform: 'translateX(-20px)' },
              '100%': { opacity: '1', transform: 'translateX(0)' },
            },
            slideRight: {
              '0%': { opacity: '0', transform: 'translateX(20px)' },
              '100%': { opacity: '1', transform: 'translateX(0)' },
            },
            pulseSlow: {
              '0%, 100%': { transform: 'scale(1)', opacity: '1' },
              '50%': { transform: 'scale(1.05)', opacity: '0.9' },
            },
            bounce: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
            popUp: {
              '0%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
              '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
            },
          },
        },
      },
      plugins: [],
    }),
  ],
});

// // vite.config.js
// import { defineConfig } from 'vite';
// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(), // Simplified, as configuration will be in tailwind.config.js
//   ],
// });