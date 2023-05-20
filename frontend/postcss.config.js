const purgecss = require('@fullhuman/postcss-purgecss');
const cssnano = require('cssnano');

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    cssnano({ preset: 'default' }),
    purgecss({
      content: ['./src/**/*.{ts,tsx}', './public/*.html'],
      defaultExtractor: content => content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
      safelist: ['bg-[url(./assets/field.svg)]'],
    }),
  ],
};
