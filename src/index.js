const assign = require('object-assign');

const defaultOptions = require('./fontstacks-config.js');

function comparableFontName (name) {
  return name.toLowerCase();
}

function getExpandedFamily (decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return null;
  }

  const fontName = comparableFontName(decl.value.replace(/["']/g, ''));
  if (fontStacks[fontName]) {
    return fontStacks[fontName];
  }
  return null;
}

function getExpandedFontShorthand (decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return null;
  }

  let result = decl.value;
  Object.keys(fontStacks).forEach(fontName => {
    const onlyOneFont = '(^|px\\s+)("|\')?' + fontName + '("|\')?(\\s*!important)?$';
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regEx = new RegExp(onlyOneFont, 'i');

    result = result.replace(regEx, '$1' + fontStacks[fontName]);
  });

  return result;
}

function getNewValue (decl, fontStacks) {
  if (decl.prop === 'font-family') {
    return getExpandedFamily(decl, fontStacks);
  } else if (decl.prop === 'font') {
    return getExpandedFontShorthand(decl, fontStacks);
  }

  return null;
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

module.exports = (opts = {}) => {
  const fontStacks = getFontStack(opts);

  return {
    postcssPlugin: 'postcss-fontstack-auto',
    Declaration(decl) {
      if (
        decl.parent.type !== 'atrule' &&
        ['font-family', 'font'].includes(decl.prop)
      ) {
        const newValue = getNewValue(decl, fontStacks);
        if (newValue) {
          decl.value = newValue;
        }
      }
    }
  }
}
module.exports.postcss = true
