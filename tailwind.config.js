/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      {
        currentTheme: {
          primary: '#00bdff',
          secondary: '#009400',
          accent: '#00c0ff',
          neutral: '#2c1a19',
          'base-100': '#2b2b2b',
          info: '#00cdff',
          success: '#a9d426',
          warning: '#cd8700',
          error: '#ff3d69',
        },
      },
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
      'dim',
      'nord',
      'sunset',
    ],
  },
  plugins: [typography, daisyui],
};
