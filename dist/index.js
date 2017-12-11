'use strict';

var assign = require('object-assign');
var postcss = require('postcss');
var valueParser = require('postcss-value-parser');

var defaultOptions = require('./fontstacks-config.js');

function comparableFontName(name) {
  return name.toLowerCase();
}

function expandFamily(decl, fontStacks) {
  var tree = valueParser(decl.value);
  if (tree.nodes.length !== 1) {
    return;
  }

  var fontName = comparableFontName(tree.nodes[0].value);
  if (fontStacks[fontName]) {
    decl.value = fontStacks[fontName];
  }
}

function expandFontShorthand(decl, fontStacks) {
  if (decl.value.match(/,/)) {
    return;
  }

  Object.keys(fontStacks).forEach(function (fontName) {
    var onlyOneFont = '("|\'?)' + fontName + '("|\')?(\s*!important)?$';
    var regEx = new RegExp(onlyOneFont, 'i');

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
  var fontStackOptions = assign(defaultOptions, opts.fontstacks);

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
          if (decl.prop === 'font-family' || decl.prop === 'font') {
            transform(decl, fontStacks);
          }
        }
      });
    });
  };
});