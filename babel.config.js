module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-json-strings'
  ]
};
