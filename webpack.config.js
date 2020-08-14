const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './src/**/*.html',
  ],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
});
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          syntax: 'postcss-scss',
          plugins: () => [
            require('postcss-import'),
            require('tailwindcss'),
            /*purgecss,*/
            require('autoprefixer'),
          ]
      }
      }
    ]
  }
};
