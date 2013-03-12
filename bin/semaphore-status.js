#!/usr/bin/env node
var context             = require('../lib/contextChecker');
var branches            = require('../lib/localBranches');
var regexFilter         = require('../lib/regexFilter');
var cachedProjects      = require('../lib/cachedProject');
var strings             = require('../lib/strings');
var branchResult        = require('../lib/branchResult');

var authToken           = process.env.SEMAPHORE_AUTH_TOKEN;
var colors              = require('colors');
var request             = require('request');
var moment              = require('moment');
var _                   = require('underscore');
var path                = require('path');
var baseURL             = "https://semaphoreapp.com/api/v1/";
var showAllBranches     = Boolean(~process.argv.indexOf("--all"));

if (authToken) {
  if (~process.argv.indexOf("--project")) {
    getBranchDetails(process.argv[process.argv.indexOf("--project")+1]);
  } else {
    getProjects();
  }
} else {
  console.log(strings.noToken);
}

function authTokenParams() {
  return "?auth_token="+authToken;
}

function getBranchDetails(hashID) {
  branches.get(function(err, localBranches) {
    if (err) {
      console.log("Error Getting Local Branches".red);
      console.log(err);
    } else {
      totalProcessed  = 0;
      console.log("\nFetching Project Details...\n".yellow);
      request.get(baseURL+"projects/"+hashID+"/branches"+authTokenParams(), function(err, res, data) {
        remoteBranches    = JSON.parse(data);
        branchData        = [];
        remoteBranches    = regexFilter(remoteBranches);
        _.each(remoteBranches, function(val) {
          getBranchInfo(hashID, val.id, function(data) {
            data.finished_at = moment(data.finished_at);
            if (~localBranches.indexOf(data.branch_name) || showAllBranches) {
              branchData.push(data);
            }
            ++totalProcessed == remoteBranches.length && outputBranchDetailResults(branchData);
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
    console.log(branchResult.print(val));
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
    console.log("Error fetching projects cache".red.inverse);
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
        console.log(strings.singleBranchMessage);
      } else {
        console.log(strings.defaultProjectFilter(data[0].name));
        getBranchDetails(data[0].hash_id);
      }
    });
  }
}

function getProjects() {
  cachedProjects.get(function(err, allProjects) {
    if (err || !allProjects || (~process.argv.indexOf("--force-update"))) {
      fetchAllProjects(null, displayProjectDetails);
    } else {
      displayProjectDetails(err, allProjects);
    }
  });
}
