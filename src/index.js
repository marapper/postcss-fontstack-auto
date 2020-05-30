const assign = require('object-assign');
const postcss = require('postcss');

const defaultOptions = require('./fontstacks-config.js');

function comparableFontName (name) {
  return name.toLowerCase();
}

function expandFamily (decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return;
  }

  const fontName = comparableFontName(decl.value.replace(/["']/g, ''));
  if (fontStacks[fontName]) {
    decl.value = fontStacks[fontName];
  }
}

function expandFontShorthand (decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return;
  }

  Object.keys(fontStacks).forEach(fontName => {
    const onlyOneFont = '(^|px\\s+)("|\')?' + fontName + '("|\')?(\\s*!important)?$';
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regEx = new RegExp(onlyOneFont, 'i');

    decl.value = decl.value.replace(regEx, '$1' + fontStacks[fontName]);
  });
}

function transform (decl, fontStacks) {
  if (decl.prop === 'font-family') {
    expandFamily(decl, fontStacks);
  } else if (decl.prop === 'font') {
    expandFontShorthand(decl, fontStacks);
  }
}

function normalizeFontName (name) {
  if (name.match(/\s/)) {
    return '"' + name + '"';
  }
  return name;
}

function getFontStack (opts) {
  const list = opts ? opts.fontstacks : {};
  const fontStackOptions = assign(defaultOptions, list || {});

  const fontStacks = {};
  Object.keys(fontStackOptions).forEach(fontName => {
    fontStacks[comparableFontName(fontName)] = fontStackOptions[fontName].map(normalizeFontName).join(', ');
  });

  return fontStacks;
}

module.exports = postcss.plugin('postcss-fontstack-auto', opts => {
  const fontStacks = getFontStack(opts);

  return css => {
    css.walkRules(rule => {
      // its ignore at-rules so it's ok
      rule.walkDecls(decl => {
        if (decl.type === 'decl') {
          if (['font-family', 'font'].includes(decl.prop)) {
            transform(decl, fontStacks);
          }
        }
      });
    });
  };
});
