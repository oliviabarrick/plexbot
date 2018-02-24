var argparser = require('argparse')

var parser = new argparser.ArgumentParser({
  prog: 'plexbot'
})

parser.addArgument(['--quality'])
parser.addArgument(['search'], {nargs: '+'})

parser.exit = function (status, message) {}

module.exports.parse = function (args) {
  return parser.parseArgs(args)
}
