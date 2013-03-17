var fs        = require('fs');
var asset     = require('assert');
var authToken = require('../lib/getAuth');

describe('getAuthToken', function() {
  before(function() {
    fs.unlink(process.env.HOME + "/.semaphorestatus-api-cache");
  });

  beforeEach(function() {
    delete process.env.SEMAPHORE_AUTH_TOKEN;
    process.argv = [];
  });

  it("should find the process env token", function() {
    process.env.SEMAPHORE_AUTH_TOKEN = "123"
    asset.equal(authToken(), "123");
  });

  it("should find the -a flag", function() {
    process.argv = ['', '', "-a", "1234"]
    asset.equal(authToken(), "1234");
  });

  it("should not find a token", function() {
    asset.equal(authToken(), undefined);
  });

  it("should read the cached CLI token", function() {
    process.argv = ['', '', "-a", "12345"]
    authToken();
    asset.equal(authToken(), "12345");
  });
});