var path = require('path');

module.exports = (ctx) => {
    var loadPaths = ctx.webpack.options.loadPaths || [];
    var allPaths = loadPaths.concat(
        [
            path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'components', '**', 'images')),
            path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'pages', '**', 'images')),
            path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'containers', '**', 'images')),
            path.resolve(path.join(path.dirname(require.resolve('ut-user')), 'ui', 'react', 'components', '**', 'images')),
            path.resolve(path.join(path.dirname(require.resolve('ut-user')), 'ui', 'assets', 'react', 'images'))
        ]
    );

    return {
        plugins: {
            'postcss-import': {
                addDependencyTo: ctx.webpack,
                path: ctx.webpack.options.postcssImportConfigPaths
            },
            'postcss-cssnext': {},
            'postcss-assets': {
                loadPaths: allPaths
            }
        }
    };
};
