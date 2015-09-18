var shellPromise = require("./shellPromises").execute;
var Q = require("q");
var fs = require("fs");

var data = {
  measurements: 0
};
var parametersToExtract = ["name", "size", "stargazers_count", "watchers_count", "open_issues_count", "forks"];
var oldestRelevantRevision = "3c5b5e5f6f0faac1fe3d04ed3158acc92a9b1cd4";

var processFile = function(timestamp, filepath) {
  var deferred = Q.defer();

  console.log("reading " + filepath);
  fs.readAsync(filepath, function(error, repositoryJson) {
    if (error) {
      console.log(" couldn't read this file " + filepath)
      deferred.reject(error);
      return;
    }
    console.log(" found contents of " + repositoryJson);
    data[timestamp] = repositoryJson;
    deferred.resolve(filepath);
  });

  return deferred.promise;
};

var extractResultFromJsonAtRevision = function(revision) {
  console.log("Working on " + revision);

  var getTimestamp = "git show --no-patch --format=%at " + revision;
  var timestampPromise = shellPromise(getTimestamp);

  timestampPromise.then(function(timestamp) {
    if (!timestamp) {
      return;
    }
    var timestamp = timestamp.trim();
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

var prepareDataStructure = function(branchName) {
  var deferred = Q.defer();

  var findGitRevisisons = "git rev-list " + branchName;
  shellPromise(findGitRevisisons).then(function(results) {
    console.log("Here are the revisions in the repository " + results);
    if (!results) {
      deferred.resolve(data);
      return;
    }
    results = results.trim().split("\n");
    var stillProcessing = true;
    var promises = [];

    results.map(function(revision) {
      if (revision === oldestRelevantRevision) {
        stillProcessing = false;
      }
      if (stillProcessing && revision) {
        promises.push(extractResultFromJsonAtRevision(revision));
      }
    });

    console.log("waiting on " + promises.length + " results");
    Q.allSettled(promises).then(function(promiseResults) {
      deferred.resolve(data);
    });

  }, function(reason) {
    console.log(reason);
    deferred.reject(reason);
  }).fail(function(exception) {
    console.log(exception);
    deferred.reject(exception);
  });

  return deferred.promise;
};

var extractData = function(dirname) {
  var deferred = Q.defer();

  fs.readdir(dirname, function(error, filelist) {
    if (error || !filelist) {
      deferred.reject(error);
      return;
    }
    var promises = [];
    // console.log("There are these files ", filelist);
    filelist.map(function(filename) {
      if (promises.length > 3) {
        return;
      }
      filename = dirname + "/" + filename;
      console.log(" Working on " + filename);
      var jsonPromise = processFile(0, filename);
      promises.push(jsonPromise);

      Q.allSettled(promises).then(function() {
        deferred.resolve(data);
      });

      count++;
    });

  });
  return deferred.promise;

};

exports.prepareDataStructure = prepareDataStructure;
exports.extractData = extractData;