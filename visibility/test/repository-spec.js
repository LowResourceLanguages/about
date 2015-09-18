var Repository = require("./../src/repository").Repository;
var fs = require("fs");

var specIsRunningTooLong = 5000;

describe("repository", function() {

  it("should load", function() {
    expect(Repository).toBeDefined();
  });

  it("should construct", function() {
    var repo = new Repository();
    expect(repo).toBeDefined();
  });

  describe("filling", function() {

    it("should should be fillable via a file stream", function(done) {
      var fileStream = fs.createReadStream("results/sillsdev___FieldWorks.json");
      var repo = new Repository(fileStream);
      expect(repo).toBeDefined();
      expect(repo.whenFilled).toBeDefined();
      repo.whenFilled.then(function() {
        expect(repo.name).toEqual("FieldWorks");
        expect(repo.forks).toEqual("3");
        expect(repo.size).toEqual("976211");
        expect(repo.stargazers_count).toEqual("11");
        expect(repo.watchers_count).toEqual("11");
        expect(repo.open_issues_count).toEqual("0");
      }).done(done);
    }, specIsRunningTooLong);

    it("should should be fillable via json object", function(done) {
      fs.readFile("results/sillsdev___FieldWorks.json", "utf8", function(error, filecontents) {
        if (error || !filecontents) {
          expect(false).toBeTruthy();
          done();
          return;
        }
        var repo = new Repository(filecontents);
        expect(repo).toBeDefined();
        expect(repo.name).toEqual("FieldWorks");
        expect(repo.forks+"").toEqual("3");
        expect(repo.size+"").toEqual("976211");
        expect(repo.stargazers_count+"").toEqual("11");
        expect(repo.watchers_count+"").toEqual("11");
        expect(repo.open_issues_count+"").toEqual("0");
        done();
      });
    }, specIsRunningTooLong);

  });

});
