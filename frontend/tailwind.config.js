/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/*.html'],
  theme: {
    extend: {
      screens: {
        tablets: { max: '840px' },
        'sm-tablets': { max: '640px' },
        phones: { max: '600px' },
        'sm-phones': { max: '500px' },
        'xs-phones': { max: '430px' },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        gray: '#808080',
        alto: '#d9d9d9',
        silver: '#c4c4c4',
        gallery: '#eeeeee',
        carnation: '#fd5a5d',
        'wild-sand': '#f4f4f4',
        'grey-200': '#eeeeee',
        'mine-shaft': '#3a3a3a',
        'athens-gray': '#eeeff2',
        'alto-shade-1': '#d8d8d8',
        'fountain-blue': '#4dbdc1',
        'mountain-meadow': '#13ad95',
      },
    },
  },
};
