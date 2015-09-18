var fs = require("fs");
var Q = require("q");

var getFileList = function(dirname) {
  var deferred = Q.defer();

  fs.readdir(dirname, function(error, filelist) {
    if (error || !filelist) {
      deferred.reject(error);
      return;
    }
    deferred.resolve(filelist);
  });

  return deferred.promise;
};


var readFile = function(filepath) {
  var deferred = Q.defer();

  console.log("reading " + filepath);
  fs.readFile(filepath, function(error, repositoryJson) {
    if (error || !repositoryJson) {
      console.log(" couldn't read this file " + filepath);
      deferred.reject(error);
      return;
    }
    console.log(" found contents of " + filepath);
    deferred.resolve(repositoryJson);
  });

  return deferred.promise;
};


exports.utils = {
  getFileList: getFileList,
  readFile: readFile
};
