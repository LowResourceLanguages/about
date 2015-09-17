var shellPromise = require("./shellPromises").execute;
var Q = require("q");


var extractResultFromJsonAtRevision = function(revision) {
  console.log("Working on " + revision);
};

var extractData = function(branchName) {
  var deferred = Q.defer();

  var findGitRevisisons = "git rev-list " + branchName;
  shellPromise(findGitRevisisons).then(function(results) {
    console.log(results);
    if (!results) {
      deferred.resolve(results);
      return;
    }
    results = results.trim().split("\n");

    results.map(function(revision) {
      if (revision) {
        extractResultFromJsonAtRevision(revision);
      }
    });

    deferred.resolve(results);
  }, function(reason) {
    console.log(reason);
    deferred.reject(reason);
  }).fail(function(exception) {
    console.log(exception);
    deferred.reject(exception);
  });

  return deferred.promise;
};

exports.extractData = extractData;
