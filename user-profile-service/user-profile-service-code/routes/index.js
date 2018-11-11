// Config
module.exports = (app, config, partials) => {
	require('./users')(app, config, partials)
}