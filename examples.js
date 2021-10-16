const re = /^xenv_config_(encoding|path|debug)=(.+)$/

function optionMatcher (args /*: Array<string> */) {
  return args.reduce(function (acc, cur) {
    const matches = cur.match(re)
    if (matches) {
      acc[matches[1]] = matches[2]
    }
    return acc
  }, {})
}; 

console.log(optionMatcher(process.argv))

// xenv_config_path=./app.example/XENV/dev.env