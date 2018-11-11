// logout.js
module.exports = (app, config, partials) => {
  app.get('/logout', (req, res) => {
  	var url=req.session.homeurl;
    req.session.destroy();
    return res.redirect(url)
  })
}
