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
    };
    console.log("Here are the relevant revisions ", options.measurementsList.length);
    deferred.resolve(options);
  });
  return deferred.promise;
};

var getDeltasBetweenMeasurements = function(options) {
  var deferred = Q.defer();

  var promises = [];
  for (var i = 1; i < options.measurementsList.length; i++) {
    // Base this measurement on the previous
    options.data[options.measurementsList[i]] = JSON.parse(JSON.stringify(options.data[options.measurementsList[i - 1]]));

    // options.data.efg = {
    //   timestamp: 124,
    //   "repo1": {
    //     name: "repo1",
    //     size: 678,
    //     stargazers_count: 4
    //   },
    //   "repo2": {
    //     name: "repo2",
    //     size: 670,
    //     stargazers_count: 8
    //   }
    // };

  }
  Q.allSettled(promises).then(function() {

    deferred.resolve(options);
  });
  return deferred.promise;
};

var exportAsTable = function(options) {
  var deferred = Q.defer();
  Q.nextTick(function() {

    options.table = [
      ["date", "name", "size", "stargazers_count"],
      [123, "repo1", 678, 3],
      [123, "repo2", 670, 8],
      [124, "repo1", 678, 4],
      [124, "repo2", 670, 8],
      [125, "repo1", 678, 4],
      [125, "repo2", 670, 8],
    ];

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
