// Webpack
var webpack           = require('webpack');
var WebpackDevServer  = require('webpack-dev-server');
var webpackConfig     = require('../webpack.config');

// Express
var express = require('express');
var history = require('connect-history-api-fallback');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require('morgan');
var errorHandler = require('express-error-handler');
// Express App
var app = express();

// Env
var PORT     = process.env.PORT || 3001;
var NODE_ENV = process.env.NODE_ENV || 'production';

// Api
var api      = require('./api');

app.use(morgan('dev'));

// Accept Content-Type
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Cross domain
app.use(cors());


/**
 * Routes
 */
// JSON API
app.use('/api', api);

//Static files
app.use('/', express.static('src/public'));


if (NODE_ENV === 'development') {
  var server = new WebpackDevServer(webpack(webpackConfig), {
    publicPath: '/__build__',
    historyApiFallback: false, // won't work due to order
    inline: true,
    quiet: false,
    hot: true,
    noInfo: true,
    stats: { colors: true }
  });
  // Webpack express app that uses socket.io
  app.use(server.app);
} else {
  app.use('/__build__', express.static('__build__'));
}


// Start the server by listening on a port
app.listen(PORT, function() {
  console.log('Listen on http://localhost:' + PORT + ' in ' + NODE_ENV);
});
