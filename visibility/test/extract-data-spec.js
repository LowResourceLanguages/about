var pipeline = require("./../src/extract-data").pipeline;
var specIsRunningTooLong = 5000;

describe("extract-data", function() {

  it("should load", function() {
    expect(pipeline).toBeDefined();
  });

  describe("flow", function() {

    it("should use the diff rather than checking out full revision", function(done) {
      var repoStatsOverTime = {
        branchName: "experiment/improving-visibility_measurements",
        resultsJsonDirname: "results",
        startingRevision: "7ce9439c132ab7c76d62750831cbdff5f1e1bbf2",
        endingRevision: "9a6eff3ce9de2e088cd7abeddb5a7ae465cb1fc9",
        attributesToExtract: ["name", "size", "stargazers_count", "forks"],
        data: {},
        measurementsList: [],
        repositoriesList: []
      };

      pipeline.getBaseLineMeasurements(repoStatsOverTime)
        .then(pipeline.getRevisionsList)
        .then(pipeline.getDeltasBetweenMeasurements)
        .then(pipeline.exportAsTable)
        .then(function(result) {
          expect(result).toBe(repoStatsOverTime);

          expect(repoStatsOverTime.filelist.length).toEqual(166);

          expect(repoStatsOverTime.measurementsList.length).toEqual(4);
          expect(repoStatsOverTime.measurementsList).toEqual([
            "7ce9439c132ab7c76d62750831cbdff5f1e1bbf2",
            "4b8b6e7a14e436f8f38fc64174f5c2a9ce28b06d",
            "007395e75d59314242028a36ebf26a447afc5ee3",
            "9a6eff3ce9de2e088cd7abeddb5a7ae465cb1fc9"
          ]);
          expect(repoStatsOverTime.repositoriesList.length).toEqual(166);

          expect(repoStatsOverTime.data["7ce9439c132ab7c76d62750831cbdff5f1e1bbf2"].AuToBI.exportAsCSV())
            .toEqual(["AuToBI", 20071, 11, 7]);
          expect(repoStatsOverTime.data["7ce9439c132ab7c76d62750831cbdff5f1e1bbf2"].BloomDesktop.exportAsCSV())
            .toEqual(["BloomDesktop", 72884, 6, 12]);

          expect(repoStatsOverTime.data["9a6eff3ce9de2e088cd7abeddb5a7ae465cb1fc9"]).not.toBe(repoStatsOverTime.data["7ce9439c132ab7c76d62750831cbdff5f1e1bbf2"]);

          expect(repoStatsOverTime.table).toBeDefined();
          expect(repoStatsOverTime.table[0]).toEqual(["year", "month", "day", "timestamp", "name", "size", "stargazers_count", "forks"]);
          console.log(repoStatsOverTime.table.join("\n"));
          // expect(repoStatsOverTime.table.join("\n")).toEqual(
          //   "year,month,day,timestamp,name,size,stargazers_count,forks\n" +
          //   "2015,08,18,1439884337000,AuToBI,20071,11,7\n" +
          //   "2015,08,18,1439884337000,BloomDesktop,72884,6,12\n" +
          //   "2015,08,18,1439884337000,PsychScript,942,5,2\n" +
          //   "2015,08,18,1439884337000,AndroidFieldDB,5091,,2\n" +
          //   "2015,08,18,1439884337000,AndroidFieldDBElicitationRecorder,1835,2,5\n" +
          //   "2015,08,18,1439884337000,AndroidLanguageLearningClientForFieldDB-sikuli,176,,\n" +
          //   "2015,08,18,1439884337000,AndroidLanguageLearningClientForFieldDB,5769,,7\n");
          expect(repoStatsOverTime.table.length).toEqual(repoStatsOverTime.measurementsList.length * repoStatsOverTime.repositoriesList.length + 1);
        })
        .catch(function(exception) {
          console.log(exception.stack);
          expect(false).toBeTruthy();
        })
        .done(done);
    }, specIsRunningTooLong);

  });
});
