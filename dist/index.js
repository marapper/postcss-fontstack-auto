"use strict";

var assign = require('object-assign');

var defaultOptions = require('./fontstacks-config.js');

function comparableFontName(name) {
  return name.toLowerCase();
}

function getExpandedFamily(decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return null;
  }

  var fontName = comparableFontName(decl.value.replace(/["']/g, ''));

  if (fontStacks[fontName]) {
    return fontStacks[fontName];
  }

  return null;
}

function getExpandedFontShorthand(decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return null;
  }

  var result = decl.value;
  Object.keys(fontStacks).forEach(function (fontName) {
    var onlyOneFont = '(^|px\\s+)("|\')?' + fontName + '("|\')?(\\s*!important)?$';
    var regEx = new RegExp(onlyOneFont, 'i');
    result = result.replace(regEx, '$1' + fontStacks[fontName]);
  });
  return result;
}

function getNewValue(decl, fontStacks) {
  if (decl.prop === 'font-family') {
    return getExpandedFamily(decl, fontStacks);
  } else if (decl.prop === 'font') {
    return getExpandedFontShorthand(decl, fontStacks);
  }

  return null;
}

function normalizeFontName(name) {
  if (name.match(/\s/)) {
    return '"' + name + '"';
  }

  return name;
}

function getFontStack(opts) {
  var list = opts ? opts.fontstacks : {};
  var fontStackOptions = assign(defaultOptions, list || {});
  var fontStacks = {};
  Object.keys(fontStackOptions).forEach(function (fontName) {
    fontStacks[comparableFontName(fontName)] = fontStackOptions[fontName].map(normalizeFontName).join(', ');
  });
  return fontStacks;
}

module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var fontStacks = getFontStack(opts);
  return {
    postcssPlugin: 'postcss-fontstack-auto',
    Declaration: function Declaration(decl) {
      if (decl.parent.type !== 'atrule' && ['font-family', 'font'].includes(decl.prop)) {
        var newValue = getNewValue(decl, fontStacks);

        if (newValue) {
          decl.value = newValue;
        }
      } // https://github.com/morishitter/postcss-font-smoothing/blob/master/index.js


      if (decl.prop === 'font-smoothing') {
        if (decl.value === 'antialiased') {
          decl.cloneBefore({
            prop: '-webkit-' + decl.prop
          });
          decl.cloneBefore({
            prop: '-moz-osx-' + decl.prop,
            value: 'grayscale'
          });
        }

        if (decl.value === 'grayscale') {
          decl.cloneBefore({
            prop: '-webkit-' + decl.prop,
            value: 'antialiased'
          });
          decl.cloneBefore({
            prop: '-moz-osx-' + decl.prop
          });
        }

        decl.remove();
      }
    }
  };
};

module.exports.postcss = true;