// Config
module.exports = (app, config, partials) => {
  require('./contacts')(app, config, partials)
  require('./impcsv')(app, config, partials)
}	