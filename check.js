#!/usr/bin/env node

var context     = require('./util/contextChecker');
var authToken  = process.env.SEMAPHORE_AUTH_TOKEN;
var colors      = require('colors');
var request     = require('request');
var moment      = require('moment');
var _           = require('underscore');
var baseURL     = "https://semaphoreapp.com/api/v1/";

if (authToken) {
  if (process.argv.length > 2) {
    getBranchDetails(process.argv[2]);
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
      return String("PENDING" + " " + data.commit.author_name).cyan.inverse + " "+
              "pushed " + moment(data.commit.timestamp).fromNow().yellow +
              "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
              data.build_url.underline;
    }
    else if (data.result == 'failed') {
      return String("☹" + " " + data.commit.author_name).red.inverse + " " +
              moment(data.finished_at).fromNow().yellow +
              "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
              data.build_url.underline;
    }
    return String("☻" + " " + data.commit.author_name).green + " " +
            moment(data.finished_at).fromNow().yellow +
            "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
            data.commit.url.underline;
  }
}

function getBranchDetails(hashID) {
  console.log("Fetching Project Details\n".yellow);
  request.get(baseURL+"projects/"+hashID+"/branches"+authTokenParams(), function(err, res, branches) {
    branches    = JSON.parse(branches);
    branchData  = [];
    _.each(branches, function(val) {
      getBranchInfo(hashID, val.id, function(data) {
        data.finished_at = moment(data.finished_at);
        branchData.push(data);
        branchData.length == branches.length && outputBranchDetailResults(branchData);
      });
    });
  });
}

function projectInContext(branches) {
  projectName = context.get();
  return _.where(branches, {name: projectName});
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

function getProjects() {
  console.log("Fetching All Projects".yellow);
  request.get(baseURL+"projects"+authTokenParams(), function(err, res, data) {
    data = JSON.parse(data);
    if (projectInContext(data).length == 0) {
      _.each(data, function(val) {
        console.log("Name: "+val.name.green);
        console.log("Key: "+val.hash_id.inverse);
      });
      console.log("\n to see individual branch statuses run\n");
      console.log("semaphoreStatus <KEY>");
    } else {
      getBranchDetails(projectInContext(data)[0].hash_id);
    }
  });
}
