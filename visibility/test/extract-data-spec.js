var pipeline = require("./../src/extract-data").pipeline;
var specIsRunningTooLong = 5000;

describe("extract-data", function() {

  it("should load", function() {
    expect(pipeline).toBeDefined();
  });

  describe("flow", function() {

    it("should use the diff rather than checking out full revision", function(done) {
      var repoStatsOverTime = {
        branchName: "experiment/improving-visibility",
        resultsJsonDirname: "results",
        startingRevision: "fed94873566aacbcad628b27d669cb648da1e5f8",
        endingRevision: "d5b4c04a891f7314962d3e8899083c541558a8c7",
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
          expect(result).toBe(repoStatsOverTime);

          expect(repoStatsOverTime.filelist.length).toEqual(166);

          expect(repoStatsOverTime.measurementsList.length).toEqual(48);
          expect(repoStatsOverTime.repositoriesList.length).toEqual(2);

          expect(repoStatsOverTime.data["fed94873566aacbcad628b27d669cb648da1e5f8"]["AuToBI"].exportAsCSV())
            .toEqual(['AuToBI', 20071, 12, 12, '', 8]);
          expect(repoStatsOverTime.data["fed94873566aacbcad628b27d669cb648da1e5f8"]["BloomDesktop"].exportAsCSV())
            .toEqual(['BloomDesktop', 73499, 6, 6, 4, 12]);

          expect(repoStatsOverTime.table).toBeDefined();
          expect(repoStatsOverTime.table.length).toEqual(repoStatsOverTime.measurementsList.length * repoStatsOverTime.repositoriesList.length + 1);
        })
        .catch(function(exception) {
          console.log(exception.stack);
          expect(false).toBeTruthy();
        })
        .done(done);
    }, specIsRunningTooLong);

  });

  xdescribe("pieces", function() {

    it("should loop through the revisions", function(done) {
      var data = {};
      prepareDataStructure("experiment/improving-visibility", data).then(function() {
        expect(data).toBeDefined();
        expect(data).toBeDefined();
        expect(data.measurements).toEqual(57);
        expect(data[1442523600000]).toBeDefined();
      }, function(results) {
        expect(results).toBeDefined();
      }).fail(function(results) {
        expect(results).toBeDefined();
      }).done(done);

    }, specIsRunningTooLong);

    xit("should loop through the files", function(done) {
      extractData("results").then(function(results) {
        expect(results).toBeDefined();

      }, function(results) {
        expect(results).toBeDefined();
      }).fail(function(results) {
        expect(results).toBeDefined();
      }).done(done);

    }, specIsRunningTooLong);

  });

});
