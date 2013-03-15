var fs                  = require('fs');
var cacheDir            = process.env.HOME + "/.semaphore-status/"
var cacheFilename       = cacheDir + "cache";

ensureCacheDirExists = function() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
}

exports.get = function(cb) {
  ensureCacheDirExists();
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
  ensureCacheDirExists();
  fs.writeFile(cacheFilename, data, 'utf8', function(err) {
    if (err) {
      console.log("Problem Saving Cache".red);
      cb(err);
    }
    cb(null, JSON.parse(data));
  });
}
