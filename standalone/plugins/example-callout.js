import { registerDesignerPlugin } from '../js/plugin-api.js';

registerDesignerPlugin({
  id: 'example.callout',
  name: 'Example Callout Plugin',
  components: {
    callout: {
      label: 'Callout', icon: 'PL', category: 'Plugins', acceptsChildren: true, tag: 'aside',
      defaultProps: {},
      defaultStyle: { base: { padding: '16px', borderLeft: '4px solid var(--color-accent)', background: 'var(--color-muted)', borderRadius: 'var(--radius-sm)' } },
      fields: [],
    },
  },
  validators: [
    (project, add) => {
      if ((project.plugins || []).includes('example.callout')) add('info', 'PLG001', 'Example callout plugin is enabled for this project.');
    },
  ],
});
