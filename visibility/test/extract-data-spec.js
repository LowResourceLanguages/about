var extractData = require("./../src/extract-data").extractData;
var prepareDataStructure = require("./../src/extract-data").prepareDataStructure;
var specIsRunningTooLong = 5000;

describe("extract-data", function() {

  it("should load", function() {
    expect(extractData).toBeDefined();
    expect(prepareDataStructure).toBeDefined();
  });

  describe("pieces", function() {

    xit("should loop through the revisions", function(done) {
      prepareDataStructure("experiment/improving-visibility").then(function(results) {
        expect(results).toBeDefined();
        expect(results.measurements).toEqual(57);
        expect(results[1442523600000]).toBeDefined();

      },function(results) {
        expect(results).toBeDefined();
      }).fail(function(results) {
        expect(results).toBeDefined();
      }).done(done);

    }, specIsRunningTooLong);

    it("should loop through the files", function(done) {
      extractData("results").then(function(results) {
        expect(results).toBeDefined();

      },function(results) {
        expect(results).toBeDefined();
      }).fail(function(results) {
        expect(results).toBeDefined();
      }).done(done);

    }, specIsRunningTooLong);

  });

});
