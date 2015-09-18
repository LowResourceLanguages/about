var Q = require("q");
var fs = require("fs");

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
exports.utils = {
  getFileList: getFileList
};
