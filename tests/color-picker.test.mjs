import assert from 'node:assert/strict';
import {
  isColorEditableProperty,
  containsColorCode,
  resolveCssVariable,
  colorPickerHex,
  replaceColorInCssValue,
  shouldOfferColorPicker,
} from '../standalone/js/color-picker.js';

assert.equal(isColorEditableProperty('color'),true);
assert.equal(isColorEditableProperty('background'),true);
assert.equal(isColorEditableProperty('boxShadow'),true);
assert.equal(isColorEditableProperty('width'),false);
assert.equal(containsColorCode('0 8px 24px rgba(15, 23, 42, .18)'),true);
assert.equal(containsColorCode('16px'),false);
assert.equal(shouldOfferColorPicker('', '#ff00aa', 'custom value'),true);
assert.equal(shouldOfferColorPicker('', '', 'accent color'),true);

assert.equal(colorPickerHex('#abc'),'#aabbcc');
assert.equal(colorPickerHex('#112233cc'),'#112233');
assert.equal(colorPickerHex('rgb(15 23 42 / .8)'),'#0f172a');
assert.equal(colorPickerHex('hsl(0 100% 50%)'),'#ff0000');
assert.equal(resolveCssVariable('var(--brand)',{brand:'var(--primary)',primary:'#2563eb'}),'#2563eb');
assert.equal(colorPickerHex('var(--brand)',{brand:'#2563eb'}),'#2563eb');
assert.equal(colorPickerHex('var(--shadow-sm)',{'shadow-sm':'0 1px 2px rgba(15,23,42,.18)'}),'#0f172a');

assert.equal(
  replaceColorInCssValue('1px solid var(--color-border)','#ff0000','border'),
  '1px solid #ff0000',
  'border picker keeps width/style and replaces only the color token',
);
assert.equal(
  replaceColorInCssValue('0 8px 24px rgba(15,23,42,.18)','#00ff00','boxShadow'),
  '0 8px 24px #00ff00',
  'shadow picker keeps offsets/blur/spread',
);
assert.equal(
  replaceColorInCssValue('var(--shadow-sm)','#336699','boxShadow',{'shadow-sm':'0 1px 2px rgba(15,23,42,.18)'}),
  '0 1px 2px #336699',
  'choosing a literal color from a compound token localizes the resolved compound value rather than collapsing it to a color',
);
assert.equal(
  replaceColorInCssValue('linear-gradient(45deg, #111827, #38bdf8)','#abcdef','backgroundImage'),
  'linear-gradient(45deg, #abcdef, #38bdf8)',
  'gradient picker replaces only one stop',
);
assert.equal(replaceColorInCssValue('var(--brand)','#123456','color',{brand:'#abcdef'}),'#123456');

console.log('color-picker.test: OK');
