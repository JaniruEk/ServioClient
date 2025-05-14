// /** @type {import('tailwindcss').Config} */
// export default {
//     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//     theme: {
//       extend: {
//         animation: {
//           'slide-down': 'slideDown 0.5s ease-out',
//           'fade-in': 'fadeIn 0.3s ease-out',
//           'slide-up': 'slideUp 0.5s ease-out',
//           'scale-up': 'scaleUp 0.5s ease-out',
//           'slide-left': 'slideLeft 0.5s ease-out',
//           'slide-right': 'slideRight 0.5s ease-out',
//           'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
//           'bounce': 'bounce 2s ease-in-out infinite',
//           'pop-up': 'popUp 0.7s ease-out forwards',
//         },
//         keyframes: {
//           slideDown: {
//             '0%': { opacity: '0', transform: 'translateY(-20px)' },
//             '100%': { opacity: '1', transform: 'translateY(0)' },
//           },
//           fadeIn: {
//             '0%': { opacity: '0' },
//             '100%': { opacity: '1' },
//           },
//           slideUp: {
//             '0%': { opacity: '0', transform: 'translateY(20px)' },
//             '100%': { opacity: '1', transform: 'translateY(0)' },
//           },
//           scaleUp: {
//             '0%': { opacity: '0', transform: 'scale(0.95)' },
//             '100%': { opacity: '1', transform: 'scale(1)' },
//           },
//           slideLeft: {
//             '0%': { opacity: '0', transform: 'translateX(-20px)' },
//             '100%': { opacity: '1', transform: 'translateX(0)' },
//           },
//           slideRight: {
//             '0%': { opacity: '0', transform: 'translateX(20px)' },
//             '100%': { opacity: '1', transform: 'translateX(0)' },
//           },
//           pulseSlow: {
//             '0%, 100%': { transform: 'scale(1)', opacity: '1' },
//             '50%': { transform: 'scale(1.05)', opacity: '0.9' },
//           },
//           bounce: {
//             '0%, 100%': { transform: 'translateY(0)' },
//             '50%': { transform: 'translateY(-10px)' },
//           },
//           popUp: {
//             '0%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
//             '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
//           },
//         },
//       },
//     },
//     plugins: [],
//   };