var Q = require("q");
var childProcess = require("child_process");
var serverInternalPath = new RegExp(__dirname.replace(/lib$/, "") + "[^.]*/", "g");

/** 
 * "Error: spawn /bin/sh EAGAIN
    at exports._errnoException (util.js:746:11)
    at Process.ChildProcess._handle.onexit (child_process.js:1053:32)
    at child_process.js:1144:20
    at process._tickCallback (node.js:355:11)"
 */

exports.execute = function(command) {
	var deferred,
		localProcess;

	console.log(command);
	deferred = Q.defer();
	// console.log(new Date() + " PATH", process.env.PATH);

	try {
		localProcess = childProcess.exec(command, function(error, stdout, stderr) {
			// console.log("in result childProcess");
			if (error !== null) {
				console.log("");
				console.log("");
				console.log("");
				console.log("");
				console.log("rejecting childProcess error");
				console.log(error);
				deferred.reject(error.message.replace(serverInternalPath, ""));
			} else {
				// console.log("resolving childProcess stdout");
				deferred.resolve(stdout);
			}
		});
	} catch (exception) {
		console.warn("Unable to run command " + command, exception.stack);
		deferred.reject(exception);
	}

	return deferred.promise;
};
