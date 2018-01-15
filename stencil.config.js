exports.config = {
  namespace: 'emoji-mart',
  generateDistribution: true,
  bundles: [
    { components: ['emart-emoji'] }
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
