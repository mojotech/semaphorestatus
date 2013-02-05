#!/usr/bin/env node

var key         = process.env.semaphoreKey;
var colors      = require('colors');
var request     = require('request');
var moment      = require('moment');
var _           = require('underscore');
var baseURL     = "https://semaphoreapp.com/api/v1/";

if (key) {
  if (process.argv.length > 2) {
    getBranchDetails(process.argv[2]);
  } else {
    getProjects();
  }
} else {
  console.log("Please enter semaphoreapp key as".red);
  console.log("export semaphoreKey='<API_KEY>'".red);
}

function authToken() {
  return "?auth_token="+key;
}


function prettyResultView(data) {
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

function getBranchDetails(hashID) {
  console.log("---Fetching---\n".yellow);
  request.get(baseURL+"projects/"+hashID+"/branches"+authToken(), function(err, res, branches) {
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

function outputBranchDetailResults(results) {
  _.each(results, function(val) {
    console.log(prettyResultView(val));
  });
}

function getBranchInfo(hashID, id, cb) {
  request.get(baseURL+"projects/"+hashID+"/"+id+"/status"+authToken(), function(err, res, data) {
    cb(JSON.parse(data));
  });
}

function getProjects() {
  console.log("Fetching Branch Info".yellow);
  request.get(baseURL+"projects"+authToken(), function(err, res, data) {
    data = JSON.parse(data);
    _.each(data, function(val) {
      console.log("Name: "+val.name.green);
      console.log("Key: "+val.hash_id.inverse);
    });
    console.log("\n to see individual branch statuses run\n");
    console.log("semaphoreStatus <KEY>");
  });
}
