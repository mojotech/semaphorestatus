#!/usr/bin/env node
var context             = require('../lib/contextChecker');
var branches            = require('../lib/localBranches');
var cachedProjects      = require('../lib/cachedProject');

var authToken           = process.env.SEMAPHORE_AUTH_TOKEN;
var colors              = require('colors');
var request             = require('request');
var moment              = require('moment');
var _                   = require('underscore');
var fs                  = require('fs');
var path                = require('path');
var baseURL             = "https://semaphoreapp.com/api/v1/";
var showAllBranches     = Boolean(~process.argv.indexOf("--all"));
var useRegex            = Boolean(~process.argv.indexOf("--regex"));
var regex               = undefined

if (useRegex) {
  regex = process.argv[process.argv.indexOf("--regex")+1]
}

if (authToken) {
  if (~process.argv.indexOf("--project")) {
    getBranchDetails(process.argv[process.argv.indexOf("--project")+1]);
  } else {
    getProjects();
  }
} else {
  console.log("Please configure your Semaphore auth token.".red);
  console.log("  (You can find it under the 'API' heading in".red);
  console.log("   the settings page for any Semaphore project.)".red);
  console.log("export SEMAPHORE_AUTH_TOKEN='<your auth token>'".red);
}

function authTokenParams() {
  return "?auth_token="+authToken;
}

function prettyResultView(data) {
  if (data.commit) {
    if (data.result == 'pending') {
      return String("PENDING" + " " + data.branch_name).cyan.inverse + " "+
              "pushed " + moment(data.commit.timestamp).fromNow().yellow +
              "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
              data.build_url.underline;
    }
    else if (data.result == 'failed') {
      return String("☹" + " " + data.branch_name).red.inverse + " " +
              moment(data.finished_at).fromNow().yellow +
              "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
              data.build_url.underline;
    }
    return String("✔" + " " + data.branch_name).green.inverse + " " +
            moment(data.finished_at).fromNow().yellow +
            "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
            data.commit.url.underline;
  }
}

function filterBranchesByRegex(branches, regex){
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

function getBranchDetails(hashID) {
  branches.get(function(err, localBranches) {
    if (err) {
      console.log("Error Fetching Local Branched".red);
      console.log(err);
    } else {
      totalProcessed  = 0;
      console.log("Fetching Project Details\n".yellow);
      request.get(baseURL+"projects/"+hashID+"/branches"+authTokenParams(), function(err, res, branches) {
        branches    = JSON.parse(branches);
        branchData  = [];
        branches = filterBranchesByRegex(branches, regex);
        _.each(branches, function(val) {
          getBranchInfo(hashID, val.id, function(data) {
            data.finished_at = moment(data.finished_at);
            if (~localBranches.indexOf(data.branch_name) || showAllBranches) {
              branchData.push(data);
            }
            ++totalProcessed == branches.length && outputBranchDetailResults(branchData);
          });
        });
      });
    }
  });
}

function projectInContext(branches, cb) {
  context.get(function(remotes) {
    cb(_.filter(branches, function(branch) {
      return _.filter(remotes, function(remote) {
        return ~remote.indexOf(branch.name);
      }).length;
    }));
  });
}

function outputBranchDetailResults(results) {
  _.each(sortByTime(results), function(val) {
    console.log(prettyResultView(val));
  });
}

function sortByTime(branches) {
  return _.sortBy(branches, function(branch) {
    if (branch.finished_at) {
      return moment(branch.finished_at).toDate().getTime()
    } else {
      return moment(branch.commit.timestamp).toDate().getTime()

    }
  }).reverse();
}

function getBranchInfo(hashID, id, cb) {
  request.get(baseURL+"projects/"+hashID+"/"+id+"/status"+authTokenParams(), function(err, res, data) {
    cb(JSON.parse(data));
  });
}

function fetchAllProjects(err, cb) {
  if (err) {
    console.log("Error".red.inverse);
    console.log(err);
  } else {
    console.log("Fetching All Projects".yellow);
    request.get(baseURL+"projects"+authTokenParams(), function(err, res, data) {
      if (err) {
        cb(err);
      } else {
        cachedProjects.save(data, cb);
      }
    });
  }
}

function displayProjectDetails(err, allProjects) {
  if (err) {
    console.log("Error".red.inverse);
  } else {
    projectInContext(allProjects, function(data) {
      if (data.length == 0) {
        _.each(allProjects, function(val) {
          console.log("Name: "+val.name.green);
          console.log("Key: "+val.hash_id.inverse);
        });
        console.log("\n to see individual branch statuses run\n");
        console.log("semaphoreStatus --project <KEY>");
      } else {
        getBranchDetails(data[0].hash_id);
      }
    });
  }
}

function getProjects() {
  cachedProjects.get(function(err, allProjects) {
    if (!allProjects || (~process.argv.indexOf("--force-update"))) {
      fetchAllProjects(err, displayProjectDetails);
    } else {
      displayProjectDetails(err, allProjects);
    }
  });
}