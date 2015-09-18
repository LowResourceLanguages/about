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
        startingRevision: "3c5b5e5f6f0faac1fe3d04ed3158acc92a9b1cd4",
        attributesToExtract: ["name", "size", "stargazers_count", "watchers_count", "open_issues_count", "forks"],
        data: {},
        measurements: 0
      };

      pipeline.getBaseLineMeasurements(repoStatsOverTime)
        .then(pipeline.getRevisionsList)
        .then(pipeline.getDeltasBetweenMeasurements)
        .then(pipeline.exportAsTable)
        .then(function(result) {
          expect(result).toBe(repoStatsOverTime);
          expect(result.measurements).toEqual(0);
        })
        .catch(function(exception) {
          console.log(exception.stack);
          expect(false).toBeTruthy();
        })
        .done(done)
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
