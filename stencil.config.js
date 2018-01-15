exports.config = {
  namespace: 'emoji-mart',
  generateDistribution: true,
  bundles: [
    { components: ['emart-emoji', 'emart-anchors', 'emart-picker', 'emart-search', 'emart-category', 'emart-preview'] }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
