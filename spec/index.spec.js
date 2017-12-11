const postcss = require('postcss');
const fs = require('fs');
const path = require('path');

const plugin = require('../src/');

it('should be ok with basic fontstack', () => {
  const name = 'basic';
  let featurePath = path.join('spec', 'demo');
  let inputCSS = fs.readFileSync(path.join(featurePath, `${name}.css`), 'utf8');
  let expectedCSS = fs.readFileSync(path.join(featurePath, `${name}.expected.css`), 'utf8');

  return postcss([plugin()]).process(inputCSS)
    .then(result => {
      expect(result.css).toEqual(expectedCSS);
      expect(result.warnings().length).toBe(0);
    });
});

it('should be ok with custom fontstack', () => {
  const name = 'custom';
  let featurePath = path.join('spec', 'demo');
  let inputCSS = fs.readFileSync(path.join(featurePath, `${name}.css`), 'utf8');
  let expectedCSS = fs.readFileSync(path.join(featurePath, `${name}.expected.css`), 'utf8');

  const fontstacks = {
    'Extra Stack': ['Extra Stack', 'Moar Fonts', 'Extra', 'serif']
  };
  return postcss([plugin({ fontstacks })]).process(inputCSS)
    .then(result => {
      expect(result.css).toEqual(expectedCSS);
      expect(result.warnings().length).toBe(0);
    });
});
