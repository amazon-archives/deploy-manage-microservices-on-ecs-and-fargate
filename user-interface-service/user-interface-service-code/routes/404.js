// 404
module.exports = (app, config, partials) => {
	// 404
	app.get('/:slug', (req, res) => {
		return res.status(404).render('404.html', {
			partials
		})
	})

}