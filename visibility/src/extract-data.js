var Q = require("q");
var Repository = require("./repository").Repository;

var shellPromise = require("./shellPromises").execute;
var utils = require("./utils").utils;

var LIMIT_RUN_SIZE = 100000;

var getBaseLineMeasurements = function(options) {
  var deferred = Q.defer();
  if (options && options.attributesToExtract) {
    Repository.DEFAULT_ATTRIBUTES_TO_EXTRACT = options.attributesToExtract;
  }

  console.log("checkout starting revision");
  shellPromise("git checkout " + options.startingRevision).then(function() {

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
        console.log("Checkout back to current branch HEAD");
        shellPromise("git checkout experiment/improving-visibility_scripts").then(function() {
          deferred.resolve(options);
        });

      });
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
      if (options.measurementsList.length > LIMIT_RUN_SIZE) {
        continue;
      }
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
  // options.data[options.measurementsList[0]].timestamp = 123456778;

  var diffPromise = shellPromise("git show --format=%H:%at " + options.measurementsList[0]);
  promises.push(diffPromise);

  for (var i = 1; i < options.measurementsList.length; i++) {
    // Base this measurement on the previous
    options.data[options.measurementsList[i]] = {};
    for (var repoName in options.data[options.measurementsList[i - 1]]) {
      var repoAtPreviousMeasurement = options.data[options.measurementsList[i - 1]][repoName];
      if (!repoAtPreviousMeasurement || repoAtPreviousMeasurement === "timestamp") {
        // console.log("This is an abnormal repo", repoAtPreviousMeasurement);
        continue;
      }
      options.data[options.measurementsList[i]][repoName] = {
        repoAtPreviousMeasurement: repoAtPreviousMeasurement
      };
      // options.data[options.measurementsList[i]][repoName] = repoAtPreviousMeasurement.clone();
      // options.data[options.measurementsList[i]][repoName].repoAtPreviousMeasurement = repoAtPreviousMeasurement;
    }
    diffPromise = shellPromise("git show --format=%H:%at " + options.measurementsList[i]);
    promises.push(diffPromise);
  }
  Q.allSettled(promises).then(function(results) {
    // console.log("diff results ", results);
    results.map(function(result) {
      if (!result || result.state !== "fulfilled") {
        return;
      }
      var lines = result.value.split(/\n/);
      var pieces = lines[0].split(":");
      var revision = pieces[0];
      var timestamp = pieces[1].trim() * 1000;
      options.data[revision].timestamp = timestamp;
      // Ignore first diff
      if (revision === options.startingRevision) {
        return;
      }
      // Chunk diffs by file
      var diffsByRepo = result.value.split("diff --git a/visibility/results/");
      diffsByRepo.map(function(diffSet) {
        try {
          lines = diffSet.split("\n");

          // Identify which repo to update
          var repoName = lines[0].substring(lines[0].lastIndexOf("___") + 3);
          if (repoName.indexOf(".json") === -1) {
            return;
          }
          repoName = repoName.substring(0, repoName.length - 5);

          // console.log(" found diff for " + repoName, options.data[revision][repoName]);
          if (!options.data[revision][repoName].exportAsCSV) {
            options.data[revision][repoName] = Repository.fillFromLastKnownMeasurement(options.data[revision][repoName].repoAtPreviousMeasurement);
          }
          options.data[revision][repoName].updateFromDiff(diffSet);
        } catch (exception) {
          console.log("There was a problem finding a previous version of this repo before this diff", exception.stack);
          // console.log(" repo is now", options.data[revision][repoName]);
        }
      });
    });
    deferred.resolve(options);
  });
  return deferred.promise;
};

var exportAsTable = function(options) {
  var deferred = Q.defer();
  Q.nextTick(function() {

    // prepare the header
    var header = ["year", "month", "day", "timestamp"].concat(options.attributesToExtract);
    options.table = [header];

    // For each measurement
    options.measurementsList.map(function(revision) {

      // Extract stats for each repo
      for (var repoName in options.data[revision]) {
        if (!options.data[revision].hasOwnProperty(repoName) || repoName === "timestamp") {
          continue;
        }
        if (!options.data[revision][repoName].exportAsCSV) {
          // console.log("this repository might have never been updated", options.data[revision][repoName]);
          options.data[revision][repoName] = Repository.fillFromLastKnownMeasurement(options.data[revision][repoName].repoAtPreviousMeasurement);
        }
        var asCsv = options.data[revision][repoName].exportAsCSV(options.attributesToExtract);
        var date = new Date(options.data[revision].timestamp);
        asCsv.unshift(options.data[revision].timestamp);

        var withPadding = date.getDate();
        if (withPadding < 10) {
          withPadding = "0" + withPadding;
        }
        asCsv.unshift(withPadding);

        withPadding = date.getMonth() + 1;
        if (withPadding < 10) {
          withPadding = "0" + withPadding;
        }
        asCsv.unshift(withPadding);

        asCsv.unshift(date.getFullYear());
        options.table.push(asCsv.join(","));
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

exports.pipeline = pipeline;
