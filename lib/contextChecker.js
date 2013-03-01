var _     = require('underscore');
var fs    = require('fs');
var exec  = require('child_process').exec

function getContext(cb) {
  exec('git remote -v', function(err, stdout, stderr) {
    if (err) {
      currentDirectory = process.cwd().split('/')
      cb([currentDirectory[currentDirectory.length - 1]]);
    } else {
      var remotes = [];
      _.each([stdout], function(val) {
        _.each(val.split("\n"), function(single) {
          if (single.split("\t")[1])
            remotes.push(single.split("\t")[1].split(" ")[0]);
        });
      });
      cb(remotes);
    }
  });
}

exports.get = getContext;