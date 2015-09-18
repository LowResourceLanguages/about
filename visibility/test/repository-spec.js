var Repository = require("./../src/repository").Repository;

describe("repository", function() {

  it("should load", function() {
    expect(Repository).toBeDefined();
  });

  it("should construct", function() {
    var repo = new Repository();
    expect(repo).toBeDefined();
  });

});
