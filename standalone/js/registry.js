export const DEFAULT_BREAKPOINTS = [
  { id: 'base', label: 'Desktop', width: 1280 },
  { id: 'tablet', label: 'Tablet', width: 820 },
  { id: 'mobile', label: 'Mobile', width: 390 },
];

const field = (key, label, kind = 'text', options = [], extra = {}) => ({ key, label, kind, options, ...extra });
const text = (key, label, extra) => field(key, label, 'text', [], extra);
const number = (key, label, extra) => field(key, label, 'number', [], extra);
const check = (key, label, extra) => field(key, label, 'checkbox', [], extra);
const select = (key, label, options, extra) => field(key, label, 'select', options, extra);
const textarea = (key, label, extra) => field(key, label, 'textarea', [], extra);

export const COMPONENTS = {
  page: {
    label: 'Page', icon: 'PG', category: 'Layout', acceptsChildren: true, tag: 'main', lockedType: true, paletteHidden: true,
    defaultProps: { title: 'Page', description: '', lang: '' },
    defaultStyle: { base: { minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' } },
    fields: [text('title', 'Title'), text('description', 'Description'), text('lang', 'Language override')],
  },
  section: {
    label: 'Section', icon: 'SE', category: 'Layout', acceptsChildren: true, tag: 'section',
    defaultProps: { ariaLabel: '' },
    defaultStyle: { base: { width: '100%', padding: '48px 24px' }, tablet: { padding: '36px 20px' }, mobile: { padding: '28px 16px' } },
    fields: [text('ariaLabel', 'ARIA label')],
  },
  container: {
    label: 'Container', icon: 'CT', category: 'Layout', acceptsChildren: true, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { width: '100%', maxWidth: '1120px', margin: '0 auto' } }, fields: [],
  },
  row: {
    label: 'Row', icon: 'RW', category: 'Layout', acceptsChildren: true, tag: 'div',
    defaultProps: {},
    defaultStyle: { base: { display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' }, mobile: { flexDirection: 'column', alignItems: 'stretch' } }, fields: [],
  },
  column: {
    label: 'Column', icon: 'CL', category: 'Layout', acceptsChildren: true, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' } }, fields: [],
  },
  stack: {
    label: 'Stack', icon: 'ST', category: 'Layout', acceptsChildren: true, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { display: 'grid', gap: '16px' } }, fields: [],
  },
  grid: {
    label: 'Grid', icon: 'GR', category: 'Layout', acceptsChildren: true, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '20px' }, tablet: { gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }, mobile: { gridTemplateColumns: '1fr' } }, fields: [],
  },
  freeform: {
    label: 'Freeform Layer', icon: 'FF', category: 'Layout', acceptsChildren: true, tag: 'div', freeformChildren: true,
    defaultProps: {}, defaultStyle: { base: { position: 'relative', width: '100%', minHeight: '420px', overflow: 'hidden', border: '1px dashed #94a3b8' } }, fields: [],
  },
  group: {
    label: 'Group', icon: 'GP', category: 'Vector', acceptsChildren: true, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { position: 'relative', minWidth: '120px', minHeight: '80px' } }, fields: [],
  },
  mask: {
    label: 'Mask / Clip', icon: 'MK', category: 'Vector', acceptsChildren: true, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { position: 'relative', width: '220px', height: '160px', overflow: 'hidden', borderRadius: '12px', background: 'transparent' } }, fields: [],
  },
  shapeRect: {
    label: 'Rectangle', icon: '▭', category: 'Vector', acceptsChildren: false, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { width: '180px', height: '120px', background: '#dbeafe', border: '1px solid #60a5fa', borderRadius: '8px' } }, fields: [],
  },
  shapeEllipse: {
    label: 'Ellipse', icon: '○', category: 'Vector', acceptsChildren: false, tag: 'div',
    defaultProps: {}, defaultStyle: { base: { width: '120px', height: '120px', background: '#ede9fe', border: '1px solid #8b5cf6', borderRadius: '50%' } }, fields: [],
  },
  svgPath: {
    label: 'Vector Path', icon: '⌁', category: 'Vector', acceptsChildren: false, tag: 'div',
    defaultProps: { path: 'M 10 60 C 40 10, 80 10, 110 60 S 180 110, 210 60' }, defaultStyle: { base: { width: '220px', height: '120px', color: '#2563eb' } }, fields: [textarea('path','SVG path data')],
  },
  rawSvg: {
    label: 'Raw SVG', icon: 'SVG', category: 'Vector', acceptsChildren: false, tag: 'div',
    defaultProps: { markup: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#60a5fa"/></svg>' }, defaultStyle: { base: { width: '120px', height: '120px' } }, fields: [textarea('markup','SVG markup')],
  },
  card: {
    label: 'Card', icon: 'CD', category: 'Layout', acceptsChildren: true, tag: 'article',
    defaultProps: {}, defaultStyle: { base: { padding: '24px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }, mobile: { padding: '18px' } }, fields: [],
  },
  header: {
    label: 'Header', icon: 'HD', category: 'Semantic', acceptsChildren: true, tag: 'header',
    defaultProps: {}, defaultStyle: { base: { width: '100%' } }, fields: [],
  },
  footer: {
    label: 'Footer', icon: 'FT', category: 'Semantic', acceptsChildren: true, tag: 'footer',
    defaultProps: {}, defaultStyle: { base: { width: '100%' } }, fields: [],
  },
  nav: {
    label: 'Navigation', icon: 'NV', category: 'Semantic', acceptsChildren: true, tag: 'nav',
    defaultProps: { ariaLabel: 'Main navigation' }, defaultStyle: { base: { display: 'flex', gap: '12px', alignItems: 'center' } }, fields: [text('ariaLabel', 'ARIA label')],
  },
  form: {
    label: 'Form', icon: 'FM', category: 'Forms', acceptsChildren: true, tag: 'form',
    defaultProps: { method: 'post', action: '', noValidate: false }, defaultStyle: { base: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    fields: [select('method', 'Method', ['get','post']), text('action', 'Action'), check('noValidate', 'Disable native validation')], events: ['submit','reset'],
  },
  fieldset: {
    label: 'Fieldset', icon: 'FS', category: 'Forms', acceptsChildren: true, tag: 'fieldset',
    defaultProps: { legend: 'Group' }, defaultStyle: { base: { display: 'grid', gap: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px' } },
    fields: [text('legend', 'Legend')],
  },
  heading: {
    label: 'Heading', icon: 'H', category: 'Content', acceptsChildren: false, tag: 'h2',
    defaultProps: { text: 'Heading', level: '2' }, defaultStyle: { base: { margin: '0', fontSize: '32px', lineHeight: '1.15', fontWeight: '700' }, tablet: { fontSize: '28px' }, mobile: { fontSize: '24px' } },
    fields: [text('text', 'Text'), select('level', 'Level', ['1','2','3','4','5','6'])], bindable: ['text'],
  },
  text: {
    label: 'Text', icon: 'TX', category: 'Content', acceptsChildren: false, tag: 'p',
    defaultProps: { text: 'Text content' }, defaultStyle: { base: { margin: '0', fontSize: '16px', lineHeight: '1.55' } },
    fields: [textarea('text', 'Text')], bindable: ['text'],
  },
  badge: {
    label: 'Badge', icon: 'BD', category: 'Content', acceptsChildren: false, tag: 'span',
    defaultProps: { text: 'Badge' }, defaultStyle: { base: { display: 'inline-flex', padding: '4px 8px', borderRadius: '999px', background: 'var(--color-muted)', fontSize: '12px', fontWeight: '600' } },
    fields: [text('text', 'Text')], bindable: ['text'],
  },
  list: {
    label: 'List', icon: 'LS', category: 'Content', acceptsChildren: false, tag: 'ul',
    defaultProps: { items: 'First item\nSecond item\nThird item', ordered: false }, defaultStyle: { base: { margin: '0', paddingLeft: '22px', lineHeight: '1.6' } },
    fields: [textarea('items', 'Items, one per line'), check('ordered', 'Ordered')],
  },
  image: {
    label: 'Image', icon: 'IM', category: 'Media', acceptsChildren: false, tag: 'img',
    defaultProps: { src: 'https://placehold.co/800x450', alt: 'Placeholder image', loading: 'lazy' }, defaultStyle: { base: { display: 'block', width: '100%', height: 'auto', borderRadius: '8px' } },
    fields: [text('src', 'Source / asset:id'), text('alt', 'Alt text'), select('loading', 'Loading', ['lazy','eager'])], bindable: ['src','alt'],
  },
  video: {
    label: 'Video', icon: 'VD', category: 'Media', acceptsChildren: false, tag: 'video',
    defaultProps: { src: '', controls: true, autoplay: false, muted: false, loop: false, poster: '' }, defaultStyle: { base: { width: '100%', height: 'auto' } },
    fields: [text('src', 'Source'), text('poster', 'Poster'), check('controls', 'Controls'), check('autoplay', 'Autoplay'), check('muted', 'Muted'), check('loop', 'Loop')],
    events: ['play','pause','ended'],
  },
  icon: {
    label: 'Icon', icon: 'IC', category: 'Content', acceptsChildren: false, tag: 'span',
    defaultProps: { text: '★', ariaLabel: '' }, defaultStyle: { base: { display: 'inline-block', fontSize: '24px', lineHeight: '1' } },
    fields: [text('text', 'Glyph/Text'), text('ariaLabel', 'ARIA label')], bindable: ['text'],
  },
  link: {
    label: 'Link', icon: 'LK', category: 'Controls', acceptsChildren: false, tag: 'a',
    defaultProps: { text: 'Link', href: '/', target: '' }, defaultStyle: { base: { color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '600' } },
    fields: [text('text', 'Text'), text('href', 'Href'), select('target', 'Target', ['','_self','_blank'])], events: ['click'], bindable: ['text','href'],
  },
  button: {
    label: 'Button', icon: 'BT', category: 'Controls', acceptsChildren: false, tag: 'button',
    defaultProps: { text: 'Button', buttonType: 'button', disabled: false }, defaultStyle: { base: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary)', color: '#fff', fontWeight: '600', cursor: 'pointer' }, mobile: { width: '100%' } },
    fields: [text('text', 'Text'), select('buttonType', 'Type', ['button','submit','reset']), check('disabled', 'Disabled')], events: ['click'], bindable: ['text','disabled'],
  },
  label: {
    label: 'Label', icon: 'LB', category: 'Forms', acceptsChildren: false, tag: 'label',
    defaultProps: { text: 'Label', htmlFor: '' }, defaultStyle: { base: { display: 'block', fontWeight: '600', marginBottom: '4px' } }, fields: [text('text', 'Text'), text('htmlFor', 'For element id')], bindable: ['text'],
  },
  input: {
    label: 'Input', icon: 'IN', category: 'Forms', acceptsChildren: false, tag: 'input',
    defaultProps: { inputType: 'text', placeholder: 'Type here…', name: 'field', value: '', required: false, disabled: false, min: '', max: '', minLength: '', maxLength: '', pattern: '', autocomplete: '' },
    defaultStyle: { base: { width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-text)' } },
    fields: [select('inputType', 'Type', ['text','email','number','password','search','tel','url','date','time','color','range']), text('name', 'Name'), text('placeholder', 'Placeholder'), text('value', 'Value'), check('required', 'Required'), check('disabled', 'Disabled'), text('min','Min'), text('max','Max'), text('minLength','Min length'), text('maxLength','Max length'), text('pattern','Pattern'), text('autocomplete','Autocomplete')],
    events: ['input','change','focus','blur'], bindable: ['value','disabled'],
  },
  textarea: {
    label: 'Textarea', icon: 'TA', category: 'Forms', acceptsChildren: false, tag: 'textarea',
    defaultProps: { placeholder: 'Type here…', name: 'message', rows: '5', required: false, disabled: false, minLength: '', maxLength: '' }, defaultStyle: { base: { width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', resize: 'vertical' } },
    fields: [text('name', 'Name'), textarea('placeholder', 'Placeholder'), text('rows', 'Rows'), check('required', 'Required'), check('disabled', 'Disabled'), text('minLength', 'Min length'), text('maxLength', 'Max length')], events: ['input','change','focus','blur'],
  },
  select: {
    label: 'Select', icon: 'SL', category: 'Forms', acceptsChildren: false, tag: 'select',
    defaultProps: { name: 'choice', options: 'Option 1|one\nOption 2|two', required: false, disabled: false }, defaultStyle: { base: { width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' } },
    fields: [text('name', 'Name'), textarea('options', 'Options Label|value'), check('required', 'Required'), check('disabled', 'Disabled')], events: ['change','focus','blur'],
  },
  checkbox: {
    label: 'Checkbox', icon: 'CK', category: 'Forms', acceptsChildren: false, tag: 'input',
    defaultProps: { name: 'check', value: 'yes', checked: false, required: false, label: 'Checkbox' }, defaultStyle: { base: { accentColor: 'var(--color-primary)' } },
    fields: [text('label','Label'), text('name','Name'), text('value','Value'), check('checked','Checked'), check('required','Required')], events: ['change','click'], bindable: ['checked'],
  },
  radio: {
    label: 'Radio', icon: 'RD', category: 'Forms', acceptsChildren: false, tag: 'input',
    defaultProps: { name: 'radio', value: 'one', checked: false, label: 'Radio' }, defaultStyle: { base: { accentColor: 'var(--color-primary)' } },
    fields: [text('label','Label'), text('name','Name'), text('value','Value'), check('checked','Checked')], events: ['change','click'], bindable: ['checked'],
  },
  divider: { label: 'Divider', icon: 'DV', category: 'Content', acceptsChildren: false, tag: 'hr', defaultProps: {}, defaultStyle: { base: { width: '100%', border: '0', borderTop: '1px solid var(--color-border)', margin: '12px 0' } }, fields: [] },
  spacer: { label: 'Spacer', icon: 'SP', category: 'Layout', acceptsChildren: false, tag: 'div', defaultProps: {}, defaultStyle: { base: { height: '24px', width: '100%' }, mobile: { height: '16px' } }, fields: [] },
  slot: {
    label: 'Slot', icon: '◫', category: 'Components', acceptsChildren: true, tag: 'slot', componentDefinitionOnly: true,
    defaultProps: { name: '' }, defaultStyle: { base: { minHeight: '36px', border: '1px dashed #94a3b8', padding: '8px' } }, fields: [text('name','Slot name (blank = default)')],
  },
  componentInstance: {
    label: 'Component Instance', icon: 'CP', category: 'Components', acceptsChildren: true, tag: 'div', paletteHidden: true,
    defaultProps: { definitionId: '', propValues: {} }, defaultStyle: { base: { display: 'contents' } }, fields: [],
  },

  repeater: {
    label: 'Data Repeater', icon: 'RP', category: 'Data', acceptsChildren: true, tag: 'div',
    defaultProps: { source: '', itemAlias: 'item', filter: '', sort: '', limit: '0', emptyText: 'No items' },
    defaultStyle: { base: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '16px' }, mobile: { gridTemplateColumns: '1fr' } },
    fields: [text('source','Data source / collection'), text('itemAlias','Item alias'), text('filter','Filter expression'), text('sort','Sort field'), text('limit','Limit'), text('emptyText','Empty text')],
  },
  externalComponent: {
    label: 'External Component', icon: 'EX', category: 'Advanced', acceptsChildren: true, tag: 'div', paletteHidden: true,
    defaultProps: { descriptorId: '', symbol: 'ExternalComponent', importPath: '', framework: 'astro', client: 'none', propsJson: '{}' },
    defaultStyle: { base: { display: 'contents' } },
    fields: [text('symbol','Symbol'), text('importPath','Import path'), select('framework','Framework',['astro','react','preact','vue','svelte','solid-js']), select('client','Hydration',['none','load','idle','visible','media','only']), textarea('propsJson','Props JSON')],
  },
  island: {
    label: 'Framework Island', icon: 'IS', category: 'Advanced', acceptsChildren: false, tag: 'div',
    defaultProps: { symbol: 'InteractiveWidget', importPath: '../components/InteractiveWidget.jsx', client: 'load', framework: 'react', media: '(max-width: 50em)', propsJson: '{}' }, defaultStyle: { base: { minHeight: '80px', padding: '12px', border: '1px dashed #7c3aed', borderRadius: '6px' } },
    fields: [text('symbol','Import symbol'), text('importPath','Import path'), select('client','Hydration',['load','idle','visible','media','only','none']), select('framework','Framework',['react','preact','vue','svelte','solid-js']), text('media','Media query'), textarea('propsJson','Props JSON')],
  },
};

export const STYLE_GROUPS = [
  { name: 'Layout', fields: [
    select('display','Display',['','block','inline-block','inline-flex','flex','grid','contents','none']),
    text('position','Position'), select('containerType','Container type',['','inline-size','size','normal']), text('containerName','Container name'), text('inset','Inset'), text('top','Top'), text('right','Right'), text('bottom','Bottom'), text('left','Left'), text('zIndex','Z index'),
    text('width','Width'), text('minWidth','Min width'), text('maxWidth','Max width'), text('height','Height'), text('minHeight','Min height'), text('maxHeight','Max height'),
    text('margin','Margin'), text('padding','Padding'), text('overflow','Overflow'),
  ]},
  { name: 'Flex / Grid', fields: [
    select('flexDirection','Flex direction',['','row','column','row-reverse','column-reverse']), select('flexWrap','Wrap',['','nowrap','wrap','wrap-reverse']), text('flex','Flex'), text('gap','Gap'), text('rowGap','Row gap'), text('columnGap','Column gap'),
    select('alignItems','Align items',['','stretch','flex-start','center','flex-end','baseline','start','end']), select('alignSelf','Align self',['','auto','stretch','flex-start','center','flex-end','baseline','start','end']), select('justifyContent','Justify',['','flex-start','center','flex-end','space-between','space-around','space-evenly','start','end']), select('justifyItems','Justify items',['','stretch','start','center','end','left','right']),
    text('gridTemplateColumns','Grid columns'), text('gridTemplateRows','Grid rows'), text('gridColumn','Grid column'), text('gridRow','Grid row'), text('placeItems','Place items'),
  ]},
  { name: 'Appearance', fields: [
    text('background','Background'), text('color','Color'), text('opacity','Opacity'), text('border','Border'), text('borderRadius','Radius'), text('boxShadow','Shadow'), text('outline','Outline'), text('filter','Filter'), text('backdropFilter','Background blur/filter'), select('mixBlendMode','Blend mode',['','normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity']),
  ]},
  { name: 'Typography', fields: [
    text('fontFamily','Font family'), text('fontSize','Font size'), text('fontWeight','Font weight'), text('lineHeight','Line height'), text('letterSpacing','Letter spacing'), select('textAlign','Text align',['','left','center','right','justify']), text('textTransform','Transform'), text('textDecoration','Decoration'), text('whiteSpace','White space'),
  ]},
  { name: 'Transform / Motion', fields: [
    text('transform','Transform'), text('transformOrigin','Transform origin'), text('transition','Transition'), text('animation','Animation'),
  ]},
];

export const ACTION_TYPES = [
  { id: 'navigate', label: 'Navigate', valueLabel: 'URL' },
  { id: 'show', label: 'Show target', target: true },
  { id: 'hide', label: 'Hide target', target: true },
  { id: 'toggleClass', label: 'Toggle class', target: true, valueLabel: 'Class' },
  { id: 'scrollTo', label: 'Scroll to', target: true },
  { id: 'setState', label: 'Set state', valueLabel: 'variable=value' },
  { id: 'toggleState', label: 'Toggle boolean state', valueLabel: 'Variable' },
  { id: 'setText', label: 'Set target text', target: true, valueLabel: 'Text / {{state.x}}' },
  { id: 'emit', label: 'Emit custom event', valueLabel: 'Event name' },
  { id: 'invokeGlobalAction', label: 'Invoke global action', valueLabel: 'context.action' },
  { id: 'submit', label: 'Submit nearest form' },
  { id: 'openOverlay', label: 'Open overlay / modal', target: true },
  { id: 'toggleOverlay', label: 'Toggle overlay / modal', target: true },
  { id: 'closeOverlay', label: 'Close overlay / modal', target: true },
  { id: 'previous', label: 'Previous screen / history' },
  { id: 'openUrl', label: 'Open external URL', valueLabel: 'URL' },
  { id: 'setComponentState', label: 'Set component state', target: true, valueLabel: 'State name' },
  { id: 'playAnimation', label: 'Play animation', target: true },
  { id: 'pauseAnimation', label: 'Pause animation', target: true },
  { id: 'stopAnimation', label: 'Stop animation', target: true },
  { id: 'reverseAnimation', label: 'Reverse animation', target: true },
  { id: 'seekAnimation', label: 'Seek animation', target: true, valueLabel: 'Progress 0-100' },
  { id: 'startTimeline', label: 'Play animation (legacy)', target: true },
  { id: 'stopTimeline', label: 'Stop animation (legacy)', target: true },
];

export const DEFAULT_TOKENS = {
  'color-bg': '#f6f8fb',
  'color-surface': '#ffffff',
  'color-text': '#17202a',
  'color-muted': '#e8edf3',
  'color-border': '#d7dce2',
  'color-primary': '#2f6fa7',
  'color-accent': '#7c3aed',
  'radius-sm': '6px',
  'radius-md': '10px',
  'shadow-sm': '0 2px 8px rgba(16,24,40,.06)',
  'space-1': '4px', 'space-2': '8px', 'space-3': '12px', 'space-4': '16px', 'space-6': '24px', 'space-8': '32px',
};
