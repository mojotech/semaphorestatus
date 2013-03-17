var fs                  = require('fs');
var cacheFilename       = process.env.HOME + "/.semaphorestatus-cache";

exports.get = function(cb) {
  fs.readFile(cacheFilename, "utf8", function(err, data) {
    if (err) {
      cb(err, false);
    } else {
      try {
        cb(null, JSON.parse(data));
      } catch (e) {
        cb(null, false);
      }
    }
  });
}

exports.save = function(data, cb) {
  fs.writeFile(cacheFilename, data, 'utf8', function(err) {
    if (err) {
      console.log("Problem Saving Cache".red);
      cb(err);
    }
    cb(null, JSON.parse(data));
  });
}