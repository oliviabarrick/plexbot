var search = require('../search')

var triggers = ['^[Aa]dd ([Tt][Vv]|[Mm]ovie|[Cc]ouchpotato) (.*)$']

module.exports = class {
  setup (expressWebserver) {
    this.setupWebserver(expressWebserver)

    var handlers = search(this)
    this.controller.on(this.callbackName, handlers.interactiveHandler)
    this.controller.hears(triggers, this.events, handlers.searchHandler)
  }

  get controller () {
    return this.bot
  }
}
