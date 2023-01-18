/* eslint no-console:0 */
var path = require('path');
var webpack = require('webpack');
const httpSolution = require('./httpServer/solution.js');
const httpAdministration = require('./httpServer/administration.js');
const httpService = require('./httpServer/service.js');

var wb = require('ut-front/webpack/ut-front.config')({
    entryPoint: [
        require.resolve(httpSolution.entryPoint),
        require.resolve(httpAdministration.entryPoint),
        require.resolve(httpService.entryPoint)
    ],
    outputPath: path.resolve(__dirname, 'dist'),
    cssImport: {
        path: path.resolve(__dirname, 'config')
    },
    cssAssets: {loadPaths: [
        path.resolve(__dirname, 'ui', 'administration', 'assets', 'react', 'images'),
        path.resolve(__dirname, 'ui', 'solution', 'assets', 'react', 'images'),
        path.resolve(__dirname, 'ui', 'service', 'assets', 'react', 'images'),
        path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'components', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'pages', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-front-react')), 'containers', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-user')), 'ui', 'react', 'components', '**', 'images')),
        path.resolve(path.join(path.dirname(require.resolve('ut-user')), 'ui', 'assets', 'react', 'images'))
    ]}
}, false);
webpack(wb, (err, stats) => {
    if (err) {
        throw err;
    } else {
        console.dir((stats.endTime - stats.startTime) / 1000, 's');
    }
});
