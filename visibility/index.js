var pipeline = require("./src/extract-data").pipeline;
var fs = require("fs");

var repoStatsOverTime = {
  branchName: "experiment/improving-visibility",
  resultsJsonDirname: "results",
  startingRevision: "0e86db036de4e664365aec3e261fefcc731da033",
  endingRevision: "435b818f9a860d90870ffbe02174494ee38f60c5",
  attributesToExtract: ["name", "size", "stargazers_count", "watchers_count", "open_issues_count", "forks"],
  data: {},
  measurementsList: [],
  repositoriesList: []
};

pipeline.getBaseLineMeasurements(repoStatsOverTime)
  .then(pipeline.getRevisionsList)
  .then(pipeline.getDeltasBetweenMeasurements)
  .then(pipeline.exportAsTable)
  .then(function(result) {
    console.log("Done");

    // console.log(repoStatsOverTime.table.join("\n"));
    fs.writeFile("results.csv", repoStatsOverTime.table.join("\n"), function(error, result) {
      console.log("Saved results in results.csv", error, result);
    });
  });
