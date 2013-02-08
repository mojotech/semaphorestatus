var fs = require('fs');

function getContext() {
  currentDirectory = process.cwd().split('/')
  return currentDirectory[currentDirectory.length - 1];
}

exports.get = getContext;