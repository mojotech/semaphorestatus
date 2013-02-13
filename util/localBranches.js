var _     = require('underscore');
var sys   = require('sys');
var exec  = require('child_process').exec;
var child;

exports.get = function(cb) {
  child = exec("git branch", function(err, stdout, stderr) {
    cb(err, _.map(stdout.split('\n'), function(val) {
      return val.substring(2, val.length);
    }));
  });
};