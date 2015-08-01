module.exports = {
  entry: ['./client/app.jsx'],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel', 'eslint'],
        include: __dirname + '/client'
      }
    ]
  }
};
