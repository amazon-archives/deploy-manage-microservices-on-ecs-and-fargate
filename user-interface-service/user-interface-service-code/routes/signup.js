// signup.js
module.exports = (app, config, partials) => {
  app.get('/signup', (req, res) => {
      return res.render('signup.html', {
        partials
      })
  })
}
