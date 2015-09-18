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

    it("should be fillable via json object", function() {
      var repo = new Repository({
        name: 'FieldWorks',
        size: '976211',
        stargazers_count: '11',
        watchers_count: '11',
        open_issues_count: '0',
        forks: '3'
      });
      expect(repo).toBeDefined();
      expect(repo.name).toEqual("FieldWorks");
      expect(repo.forks + "").toEqual("3");
      expect(repo.size + "").toEqual("976211");
      expect(repo.stargazers_count + "").toEqual("11");
      expect(repo.watchers_count + "").toEqual("11");
      expect(repo.open_issues_count + "").toEqual("0");
    });

    it("should be fillable via a file stream", function(done) {
      var fileStream = fs.createReadStream("results/sillsdev___FieldWorks.json");
      var repo = new Repository(fileStream);
      expect(repo).toBeDefined();
      expect(repo.whenFilled).toBeDefined();
      repo.whenFilled.then(function() {
        expect(repo.name).toEqual("FieldWorks");
        expect(repo.forks + "").toEqual("3");
        expect(repo.size + "").toEqual("976211");
        expect(repo.stargazers_count + "").toEqual("11");
        expect(repo.watchers_count + "").toEqual("11");
        expect(repo.open_issues_count + "").toEqual("0");
      }).done(done);
    }, specIsRunningTooLong);

    it("should be fillable via string containing json", function(done) {
      fs.readFile("results/sillsdev___FieldWorks.json", "utf8", function(error, filecontents) {
        if (error || !filecontents) {
          expect(false).toBeTruthy();
          done();
          return;
        }
        var repo = new Repository(filecontents);
        expect(repo).toBeDefined();
        expect(repo.name).toEqual("FieldWorks");
        expect(repo.forks + "").toEqual("3");
        expect(repo.size + "").toEqual("976211");
        expect(repo.stargazers_count + "").toEqual("11");
        expect(repo.watchers_count + "").toEqual("11");
        expect(repo.open_issues_count + "").toEqual("0");
        done();
      });
    }, specIsRunningTooLong);

  });


  describe("export", function() {

    it("should export empty fields", function() {
      var repo = new Repository();
      expect(repo).toBeDefined();

      var asCSV = repo.exportAsCSV();
      expect(asCSV).toEqual(['', '', '', '', '', '']);
    });

    it("should accept a custom header", function() {
      var repo = new Repository();
      expect(repo).toBeDefined();

      var asCSV = repo.exportAsCSV(["something", "which", "doesnt", "exist"]);
      expect(asCSV).toEqual(['', '', '', '']);
    });

    it("should provide data in an array shape", function() {
      var repo = new Repository({
        name: 'FieldWorks',
        size: '976211',
        stargazers_count: '11',
        watchers_count: '11',
        open_issues_count: '0',
        forks: '3'
      });
      expect(repo).toBeDefined();

      expect(repo.name).toEqual("FieldWorks");
      expect(repo.forks + "").toEqual("3");
      expect(repo.size + "").toEqual("976211");
      expect(repo.stargazers_count + "").toEqual("11");
      expect(repo.watchers_count + "").toEqual("11");
      expect(repo.open_issues_count + "").toEqual("0");
      var asCSV = repo.exportAsCSV();
      expect(asCSV).toEqual(['FieldWorks', '976211', '11', '11', '0', '3']);
    });

  });

  describe("clone", function() {

    it("should clone empty fields", function() {
      var repo = new Repository();
      expect(repo).toBeDefined();

      var clone = repo.clone();
      expect(clone).toEqual({});
    });

    it("should provide data in an array shape", function() {
      var repo = new Repository({
        name: 'original'
      });

      var clone = repo.clone();
      expect(clone).toBeDefined();
      expect(clone instanceof Repository).toBeTruthy();

      expect(clone.name).toEqual(repo.name);
      clone.name = "changed";
      expect(repo.name).toEqual("original");
      expect(clone.name).toEqual("changed");
    });

  });


});
