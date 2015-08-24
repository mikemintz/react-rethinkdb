module.exports = {
  entry: ['./client/app.jsx'],
  output: {
    path: __dirname,
    filename: 'assets/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: __dirname + '/client'
      }
    ]
  }
};
