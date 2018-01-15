exports.config = {
  namespace: 'emoji-mart',
  generateDistribution: true,
  bundles: [
    { components: ['emart-emoji', 'emart-anchors', 'emart-picker'] }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
