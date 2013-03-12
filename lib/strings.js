var colors              = require('colors');

exports.noToken = "\n"+
  "Please configure your Semaphore auth token.".yellow.inverse + "\n" +
  "\n-- (You can find it under the 'API' heading in".yellow + "\n" +
  "-- the settings page for any Semaphore project.)".yellow + "\n" +
  "\nexport SEMAPHORE_AUTH_TOKEN='<your auth token>'\n".red;

exports.singleBranchMessage = ""+
  "\nTo see individual branch statuses run\n".cyan.inverse +
  "semaphoreStatus --project <KEY>".cyan+"\n";

exports.defaultProjectFilter = function(projName) {
  return ("Showing branches for \"" + projName + "\"." +
    "\nTo view another project's branches, try \"--project\".").yellow;
};
