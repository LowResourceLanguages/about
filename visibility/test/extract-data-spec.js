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
        expect(results.length).toEqual(75);
        expect(results[results.length-1]).toEqual("5c33b4f4764fec18b9345b21466d42b5a0c55a99");
      

      },function(results) {
        expect(results).toBeDefined();
      }).fail(function(results) {
        expect(results).toBeDefined();
      }).done(done);

    }, specIsRunningTooLong);

  });

});
