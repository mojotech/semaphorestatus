var _     = require('underscore');
var sys   = require('sys');
var exec  = require('child_process').exec;
var child;

function extractRelativeBranchName(line) {
  var fullBranch = line.substring(line.indexOf('[') + 1, line.lastIndexOf(']'));
  return fullBranch.substring(fullBranch.indexOf('/') + 1);
}

exports.get = function(cb) {
  child = exec("git branch -vv", function(err, stdout, stderr) {
    cb(err, _.map(stdout.split('\n'), extractRelativeBranchName));
  });
};

