// home.js

module.exports = (app, config, partials) => {
  app.get('/', (req, res) => {
      if (req.query.message === 'unauthorized')
        res.locals.unauthorized_message = true
      return res.render('index.html', {
        partials
      })
  })
}
