var assign = require('object-assign');
var postcss = require('postcss');
var valueParser = require('postcss-value-parser');

const defaultOptions = require('./fontstacks-config.js');

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
    var onlyOneFont = fontName + '$';
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
  const fontStackOptions = assign(defaultOptions, opts.fontstacks);

  const fontStacks = {};
  Object.keys(fontStackOptions).forEach(function (fontName) {
    fontStacks[comparableFontName(fontName)] = fontStackOptions[fontName].map(normalizeFontName).join(', ');
  });

  return fontStacks;
}

module.exports = postcss.plugin('postcss-fontstack-auto', function (opts) {
  const fontStacks = getFontStack(opts);

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


// function toTitleCase(str) {
// }
//
// module.exports = postcss.plugin('fontstack', (options) => {
//     const fontstackOptions = Object.assign(defaultOptions, options.fontstacks);
//
//
//     return (root) => {
//         root.walkRules((rule) => {
//             rule.walkDecls((decl) => {
//                 const value = decl.value;
//
//                 if (value.indexOf('fontstack(') !== -1) {
//                     let fontstackRequested = value.match(/\(([^)]+)\)/)[1].replace(/["']/g, '');
//                     fontstackRequested = toTitleCase(fontstackRequested);
//                     const fontstack = fontstacks[fontstackRequested];
//                     const firstFont = value.substr(0, value.indexOf('fontstack('));
//                     const newValue = firstFont + fontstack;
//                     decl.value = newValue;
//                 }
//             });
//
//         });
//     };
// });
