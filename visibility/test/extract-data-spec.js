var extractData = require("./../src/extract-data").extractData;
var specIsRunningTooLong = 5000;

describe("extract-data", function() {

  it("should load", function() {
    expect(extractData).toBeDefined();
  });

  describe("pipeline", function() {

    it("loop through the revisions", function(done) {
      extractData("experiment/improving-visibility").then(function(results) {
        expect(results).toBeDefined();
        expect(results.measurements).toEqual(57);
        expect(results[1442523600000]).toBeDefined();

      },function(results) {
        expect(results).toBeDefined();
      }).fail(function(results) {
        expect(results).toBeDefined();
      }).done(done);

    }, specIsRunningTooLong);

  });

});
