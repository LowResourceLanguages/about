var readline = require("readline");
var Q = require("q");

var Repository = function(options) {

  if (options && options.readable && options.path) {
    console.log("Constructing from only a file sream", options.path);
    try {
      var reader = readline.createInterface({
        input: options
      });
      var self = this;
      if (options.attributesToExtract) {
        this.attributesToExtract = options.attributesToExtract;
      }
      var attributesToExtract = this.attributesToExtract;
      var deferred = Q.defer();
      self.whenFilled = deferred.promise;

      reader.on("SIGINT", function() {
        console.log("interuppted");
        reader.pause();
      });

      reader.on('close', function() {
        reader.close();
        reader = null;
        deferred.resolve(self);
      });

      reader.on("line", function(line) {
        if (!line) {
          return;
        }
        try {
          attributesToExtract.map(function(attribute) {
            // skip if the attribute is already set
            if (!attribute || self[attribute]) {
              return;
            }
            // console.log("Looking for " + attribute);
            // Expects a properly formated json string with quotes around the properties
            var quotedAttribute = "\"" + attribute + "\": ";
            if (line && line.indexOf(quotedAttribute) > -1) {
              self[attribute] = line.substring(line.lastIndexOf(quotedAttribute) + quotedAttribute.length);
              self[attribute] = self[attribute].replace(/,$/, "");
              if (self[attribute][0] === "\"" && self[attribute][self[attribute].length - 1] === "\"") {
                self[attribute] = self[attribute].replace(/^"/, "").replace(/"$/, "");
              }
              attributesToExtract.splice(attributesToExtract.indexOf(attribute), 1);
              // console.log("found, now looking for ", attributesToExtract);
            }
          });
        } catch (exception) {
          console.log("There was a problem parsing this line", exception.stack);
        }
      });

    } catch (exception) {
      console.log(exception.stack);
    }
  } else if (options) {
    if (typeof options.indexOf === "function" && options.indexOf("{") === 0) {
      console.log("Constructing from stringified json ");
      try {
        options = JSON.parse(options);
      } catch (exception) {
        console.log("There was a problem parsing the repository json", exception.stack);
      }
    } else {
      console.log("Constructing from options ");
    }
    for (var member in options) {
      if (!options.hasOwnProperty(member) || this.attributesToExtract.indexOf(member) === -1) {
        continue;
      }
      this[member] = options[member];
    }
  } else {
    console.log("Constructing without options");
  }
  Object.apply(this, arguments);
};

Repository.prototype = Object.create(Object.prototype, {
  constructor: Repository,

  attributesToExtract: {
    get: function() {
      if (!this._attributesToExtract) {
        return ["name", "size", "stargazers_count", "watchers_count", "open_issues_count", "forks"];
      }
      return this._attributesToExtract;
    },
    set: function(value) {
      this._attributesToExtract = value;
    }
  },

  exportAsCSV: {
    value: function(optionalAttributes) {
      var asCSV = [];
      var self = this;
      optionalAttributes = optionalAttributes || this.attributesToExtract;

      optionalAttributes.map(function(attribute) {
        // console.log("looking for " + attribute, self[attribute]);
        asCSV.push(self[attribute] ? self[attribute] : "");
      });
      return asCSV;
    }
  },

  clone: {
    value: function() {
      var clone = {};

      for (var attrib in this) {
        if (!this.hasOwnProperty(attrib)) {
          continue;
        }
        clone[attrib] = this[attrib] + "";
      }

      return new Repository(clone);
    }
  }
});

exports.Repository = Repository;
