var fs                = require('fs');
var apiCacheFilename  = process.env.HOME + "/.semaphorestatus-api-cache";

module.exports = function() {
  if (process.env.SEMAPHORE_AUTH_TOKEN) {
    return process.env.SEMAPHORE_AUTH_TOKEN
  } else if (~~process.argv.indexOf('-a')) {
    return cacheApiKey();
  } else if (fs.existsSync(apiCacheFilename)) {
    return fs.readFileSync(apiCacheFilename, 'utf8');
  } else {
    return undefined;
  }
}

function cacheApiKey() {
  var key = process.argv[process.argv.indexOf('-a')+1];
  fs.writeFileSync(apiCacheFilename, key)
  return key;
}