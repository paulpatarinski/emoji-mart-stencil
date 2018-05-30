exports.config = {
  namespace: 'emoji-mart',
  bundles: [
    { components: ['emart-emoji', 'emart-anchors', 'emart-picker', 'emart-search', 'emart-category', 'emart-preview'] }
  ],
  outputTargets: [
    { type: 'www' },
    { type: 'dist' }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
