const postcss = require('postcss');
const fs = require('fs');
const path = require('path');

const plugin = require('../src/');
const fontstacks = {
  'Extra Stack': ['Extra Stack', 'Moar Fonts', 'Extra', 'serif']
};

function run(input, output, options) {
  return postcss([plugin({ fontstacks: options })]).process(input)
    .then(result => {
      expect(result.css).toEqual(output);
      expect(result.warnings().length).toBe(0);
    });
}

const features = ['basic', 'custom'];
features.forEach(name => {
  let featurePath = path.join('spec', 'demo');
  let inputCSS = fs.readFileSync(path.join(featurePath, `${name}.css`), 'utf8');
  let expectedCSS = fs.readFileSync(path.join(featurePath, `${name}.expected.css`), 'utf8');

  it(`test ${name} feature: `, () => {
    return run(inputCSS, expectedCSS, name === 'custom' ? fontstacks : {});
  });
});
