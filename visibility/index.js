var pipeline = require("./src/extract-data").pipeline;
var fs = require("fs");

var repoStatsOverTime = {
  branchName: "experiment/improving-visibility_measurements",
  resultsJsonDirname: "results",
  startingRevision: "7f28be7ef273b9778f4cf805f3c43b2307624d8b",
  endingRevision: "04e8ed8b7be09bcb13cd1756e6d42905d4ff3fce",
  attributesToExtract: ["name", "size", "stargazers_count", "subscribers_count", "open_issues_count", "forks"],
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
    fs.writeFile("results.csv", repoStatsOverTime.table.join("\n"), function(error) {
      if (!error) {
        console.log("Saved results in longitudinal_visibility.csv", error);
      } else {
        console.log("Unable to save results", error);
      }
    });
  });
