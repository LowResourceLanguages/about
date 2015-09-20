var pipeline = require("./src/extract-data").pipeline;
var fs = require("fs");
var shellPromise = require("./src/shellPromises").execute;

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


// pipeline.getBaseLineMeasurements(repoStatsOverTime)
//   .then(pipeline.getRevisionsList)
//   .then(pipeline.getDeltasBetweenMeasurements)
pipeline.getRevisionsList(repoStatsOverTime)
  .then(pipeline.getFileContentsAtRevisions)
  .then(pipeline.exportAsTable)
  .then(function(result) {
    console.log("Done");

    // console.log(repoStatsOverTime.table.join("\n"));
    fs.writeFile("longitudinal_visibility.csv", repoStatsOverTime.table.join("\n"), function(error) {
      if (!error) {
        console.log("Saved results in longitudinal_visibility.csv");
        shellPromise(" header=`grep year longitudinal_visibility.csv`" +
          " && echo $header > longitudinal_visibility_sorted.csv" +
          " && sort --field-separator=',' -k 6,6  -k 4,4 longitudinal_visibility.csv >> longitudinal_visibility_sorted.csv " +
          " && mv longitudinal_visibility_sorted.csv longitudinal_visibility.csv "
        ).then(function() {
          console.log("  Sorted by repository name and timestamp.");
        });

      } else {
        console.log("Unable to save results", error);
      }
    });
  });
