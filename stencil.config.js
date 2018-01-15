exports.config = {
  namespace: 'emoji-mart',
  generateDistribution: true,
  bundles: [
    { components: ['emart-emoji', 'emart-anchors', 'emart-picker', 'emart-search', 'emart-category'] }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
