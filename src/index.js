const assign = require('object-assign');
const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

const defaultOptions = require('./fontstacks-config.js');

function comparableFontName(name) {
  return name.toLowerCase();
}

function expandFamily(decl, fontStacks) {
  const tree = valueParser(decl.value);
  if (tree.nodes.length !== 1) {
    return;
  }

  const fontName = comparableFontName(tree.nodes[0].value);
  if (fontStacks[fontName]) {
    decl.value = fontStacks[fontName];
  }
}

function expandFontShorthand(decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return;
  }

  Object.keys(fontStacks).forEach((fontName) => {
    const onlyOneFont = '("|\'?)' + fontName + '("|\')?(\s*!important)?$';
    const regEx = new RegExp(onlyOneFont, 'i');

    decl.value = decl.value.replace(regEx, fontStacks[fontName]);
  });
}

function transform(decl, fontStacks) {
  if (decl.prop === 'font-family') {
    expandFamily(decl, fontStacks);
  } else if (decl.prop === 'font') {
    expandFontShorthand(decl, fontStacks);
  }
}

function normalizeFontName(name) {
  if (name.match(/\s/)) {
    return '"' + name + '"';
  }
  return name;
}

function getFontStack(opts) {
  const fontStackOptions = assign(defaultOptions, opts.fontstacks);

  const fontStacks = {};
  Object.keys(fontStackOptions).forEach(fontName => {
    fontStacks[comparableFontName(fontName)] = fontStackOptions[fontName].map(normalizeFontName).join(', ');
  });

  return fontStacks;
}

module.exports = postcss.plugin('postcss-fontstack-auto', (opts) => {
  const fontStacks = getFontStack(opts);

  return css => {
    css.walkRules(rule => {
      // its ignore at-rules so it's ok
      rule.walkDecls(decl => {
        if (decl.type === 'decl') {
          if (decl.prop === 'font-family' || decl.prop === 'font') {
            transform(decl, fontStacks);
          }
        }
      });
    });
  };
});
