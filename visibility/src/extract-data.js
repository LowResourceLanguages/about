var Q = require("q");
var Repository = require("./repository").Repository;

var shellPromise = require("./shellPromises").execute;
var utils = require("./utils").utils;

var LIMIT_RUN_SIZE = 2;

var getBaseLineMeasurements = function(options) {
  var deferred = Q.defer();

  console.log("TODO checkout starting revision");
  utils.getFileList(options.resultsJsonDirname).then(function(filelist) {
    options.filelist = filelist;

    var promises = [];
    options.filelist.map(function(filename) {
      if (!filename || promises.length >= LIMIT_RUN_SIZE) {
        return;
      }
      filename = options.resultsJsonDirname + "/" + filename;
      promises.push(utils.readFile(filename));
    });

    console.log("waiting on " + promises.length + " results");
    options.data = options.data || {};
    options.data[options.startingRevision] = options.data[options.startingRevision] || {};
    options.repositoriesList = [];
    Q.allSettled(promises).then(function(results) {
      // console.log("Files ", results);
      results.map(function(result) {
        if (result.state !== "fulfilled") {
          console.log("This file wasnt read", result);
          return;
        }
        try {
          var repo = new Repository(result.value);
          if (!repo && !repo.name) {
            console.log("This file wasn't a repo", result);
            return;
          }
          options.data[options.startingRevision][repo.name] = repo;
          options.repositoriesList.push(repo.name);
        } catch (exception) {
          console.log("There was a problem building this repository from file", exception.stack);
        }
      });
      console.log("TODO checkout back to current branch HEAD");
      deferred.resolve(options);
    });
  });
  return deferred.promise;
};

var getRevisionsList = function(options) {
  var deferred = Q.defer();

  shellPromise("git rev-list " + options.branchName).then(function(results) {
    if (!results) {
      deferred.resolve(options);
      return;
    }
    results = results.trim().split("\n");
    console.log("Here are the revisions in the repository " + results.length);

    var foundFirstRevision = false;
    var foundLastRevision = false;
    options.measurementsList = [];
    for (var i = results.length - 1; i >= 0; i--) {
      var revision = results[i];
      if (revision === options.startingRevision) {
        // console.log("Found first revision " + revision)
        foundFirstRevision = true;
      }
      // console.log("Looking at " + revision)
      if (foundFirstRevision && !foundLastRevision && revision) {
        options.measurementsList.push(revision);
      } else {
        // console.log("Found first: " + foundFirstRevision + ", found last: " + foundLastRevision + " revision: " + revision);
      }
      if (revision === options.endingRevision) {
        // console.log("Found last revision " + revision)
        foundLastRevision = true;
      }
    }
    console.log("Here are the relevant revisions ", options.measurementsList.length);
    deferred.resolve(options);
  });
  return deferred.promise;
};

var getDeltasBetweenMeasurements = function(options) {
  var deferred = Q.defer();

  var promises = [];

  // TODO get the timestamp for the first measurement
  options.data[options.measurementsList[0]].timestamp = 123456778;

  for (var i = 1; i < options.measurementsList.length; i++) {
    // Base this measurement on the previous
    options.data[options.measurementsList[i]] = {};
    for (var repoName in options.data[options.measurementsList[i - 1]]) {
      var previousRepo = options.data[options.measurementsList[i - 1]][repoName];
      if (!previousRepo || previousRepo === "timestamp" || typeof previousRepo.clone !== "function") {
        // console.log("This is an abnormal repo", previousRepo);
        continue;
      }
      options.data[options.measurementsList[i]][repoName] = previousRepo.clone();
    }
    options.data[options.measurementsList[i]].timestamp = 123456778;
  }
  Q.allSettled(promises).then(function() {

    deferred.resolve(options);
  });
  return deferred.promise;
};

var exportAsTable = function(options) {
  var deferred = Q.defer();
  Q.nextTick(function() {

    // prepare the header
    options.table = [options.attributesToExtract];
    options.table[0].unshift("date");

    // For each measurement
    options.measurementsList.map(function(revision) {

      // Extract stats for each repo
      for (var repoName in options.data[revision]) {
        if (!options.data[revision].hasOwnProperty(repoName) || repoName === "timestamp") {
          continue;
        }
        options.table.push(options.data[revision][repoName].exportAsCSV(options.attributesToExtract));
      }
    });

    deferred.resolve(options);
  });
  return deferred.promise;
};


var pipeline = {
  getBaseLineMeasurements: getBaseLineMeasurements,
  getRevisionsList: getRevisionsList,
  getDeltasBetweenMeasurements: getDeltasBetweenMeasurements,
  exportAsTable: exportAsTable
};


var extractResultFromJsonAtRevision = function(revision) {
  console.log("Working on " + revision);

  var getTimestamp = "git show --no-patch --format=%at " + revision;
  var timestampPromise = shellPromise(getTimestamp);

  timestampPromise.then(function(timestamp) {
    if (!timestamp) {
      return;
    }
    timestamp = timestamp.trim();
    // Make the timestamp javascript rather than unix
    timestamp = timestamp * 1000;

    console.log(revision + " was at " + new Date(timestamp));

    data[timestamp] = {};
    data.measurements++;
    return timestamp;
  }, function(reason) {
    return reason;
  }).fail(function(exception) {
    return exception;
  });
  return timestampPromise;
};

exports.pipeline = pipeline;
