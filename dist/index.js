"use strict";

var assign = require('object-assign');

var postcss = require('postcss');

var defaultOptions = require('./fontstacks-config.js');

function comparableFontName(name) {
  return name.toLowerCase();
}

function expandFamily(decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return;
  }

  var fontName = comparableFontName(decl.value.replace(/['"]/g, ''));

  if (fontStacks[fontName]) {
    decl.value = fontStacks[fontName];
  }
}

function expandFontShorthand(decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return;
  }

  Object.keys(fontStacks).forEach(function (fontName) {
    var onlyOneFont = '(^|px\\s+)("|\')?' + fontName + '("|\')?(\\s*!important)?$'; // eslint-disable-next-line security/detect-non-literal-regexp

    var regEx = new RegExp(onlyOneFont, 'i');
    decl.value = decl.value.replace(regEx, '$1' + fontStacks[fontName]);
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
  var list = opts ? opts.fontstacks : {};
  var fontStackOptions = assign(defaultOptions, list || {});
  var fontStacks = {};
  Object.keys(fontStackOptions).forEach(function (fontName) {
    fontStacks[comparableFontName(fontName)] = fontStackOptions[fontName].map(normalizeFontName).join(', ');
  });
  return fontStacks;
}

module.exports = postcss.plugin('postcss-fontstack-auto', function (opts) {
  var fontStacks = getFontStack(opts);
  return function (css) {
    css.walkRules(function (rule) {
      // its ignore at-rules so it's ok
      rule.walkDecls(function (decl) {
        if (decl.type === 'decl') {
          if (['font-family', 'font'].includes(decl.prop)) {
            transform(decl, fontStacks);
          }
        }
      });
    });
  };
});