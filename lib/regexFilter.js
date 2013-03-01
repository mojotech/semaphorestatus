var _                   = require('underscore');
var useRegex            = Boolean(~process.argv.indexOf("--regex"));
var regex;

if (useRegex) {
  regex = process.argv[process.argv.indexOf("--regex")+1]
}

module.exports = function(branches) {
  if (typeof regex != 'undefined') {
    try {
      var pattern = new RegExp(regex)
      branches = _.filter(branches, function(branch){ return pattern.test(branch['name']) });
    } catch(e) {
      console.log(e.toString().red)
    }
  }
  return branches;
}