module.exports = {
	entry: ['./client/app.jsx'],
	output: {
		path: __dirname + '/assets',
		filename: 'bundle.js'
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
