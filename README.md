# postcss-fontstack-auto

PostCSS plugin to expand font names to [web-safe stack](https://www.cssfontstack.com/) automatically.

Originally [postcss-fontstack](https://github.com/tomoyuen/postcss-fontstack) force to use `fontstack()`.

```css
.some {
  font-family: Arial;
  font: 30px/20px Courier;
  /* will be unchanged */
  font-family: Arial, Roboto, sans-serif;
}
```

will be

```css
.some {
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  font: 30px/20px "Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace;
  /* unchanged */
  font-family: Arial, Roboto, sans-serif;
}
```

Use [postcss-minify-font-values](https://www.npmjs.com/package/postcss-minify-font-values) for minifying.

##  postcss-font-smoothing

Because [postcss-font-smoothing](https://github.com/morishitter/postcss-font-smoothing) is not adapted for postcss 8

```css
    font-smoothing: antialiased;
    /* or */
    font-smoothing: grayscale;
```

would be

```css
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
```

## Usage

Expand rules with your own font names and stacks.

``` js
require('postcss-fontstack-auto')({
  fontstack: [
    'YourScript': ['Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif']
  ]
})
```

### Options

*fontstack* Array. Key is font name. Value is Array of font names (if it have whitespace in name
then it will be in double quotes).

Every word in font name should start with uppercased letter, e.g. `Unique-Light Sans`.
