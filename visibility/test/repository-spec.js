var Repository = require("./../src/repository").Repository;
var fs = require("fs");

var specIsRunningTooLong = 5000;

describe("repository", function() {

  beforeEach(function() {
    Repository.DEFAULT_ATTRIBUTES_TO_EXTRACT = ["name", "size", "stargazers_count"];
  });

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
      expect(repo.size + "").toEqual("976211");
      expect(repo.stargazers_count + "").toEqual("11");
    });

    it("should be fillable via a file stream", function(done) {
      var fileStream = fs.createReadStream("results/sillsdev___FieldWorks.json");
      var repo = new Repository(fileStream);
      expect(repo).toBeDefined();
      expect(repo.whenFilled).toBeDefined();
      repo.whenFilled.then(function() {
        expect(repo.name).toEqual("FieldWorks");
        expect(repo.size + "").toEqual("974774");
        expect(repo.stargazers_count + "").toEqual("11");
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
        expect(repo.size + "").toEqual("974774");
        expect(repo.stargazers_count + "").toEqual("11");
        done();
      });
    }, specIsRunningTooLong);

  });


  describe("export", function() {

    it("should export empty fields", function() {
      var repo = new Repository();
      expect(repo).toBeDefined();

      var asCSV = repo.exportAsCSV();
      expect(asCSV).toEqual(['', '', '']);
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
      expect(repo.size + "").toEqual("976211");
      expect(repo.stargazers_count + "").toEqual("11");
      var asCSV = repo.exportAsCSV();
      expect(asCSV).toEqual(['FieldWorks', '976211', '11']);
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

  describe("update from diff", function() {

    it("should clone empty fields", function() {
      var repo = new Repository({
        name: 'FieldWorks',
        size: '976211',
        stargazers_count: '11',
        watchers_count: '11',
        open_issues_count: '0',
        forks: '3'
      });
      expect(repo).toBeDefined();
      expect(repo.size + "").toEqual("976211");
      repo.updateFromDiff("-  \"size\": 73634,\n+  \"size\": 74210,\n");

      expect(repo.name).toEqual("FieldWorks");
      expect(repo.size + "").toEqual("74210");
      expect(repo.stargazers_count + "").toEqual("11");
    });

  });


  describe("fill from a previous measurement", function() {

    it("should recurse until a measurement is found", function() {
      var baseline = new Repository({
        name: 'FieldWorks',
        size: '976211',
        stargazers_count: '11',
        watchers_count: '11',
        open_issues_count: '0',
        forks: '3'
      });
      var measurementTwo = {
        repoAtPreviousMeasurement: baseline
      };
      var measurementThree = {
        repoAtPreviousMeasurement: measurementTwo
      };
      var measurementFour = {
        repoAtPreviousMeasurement: measurementThree
      };
      measurementFour = Repository.fillFromLastKnownMeasurement(measurementFour.repoAtPreviousMeasurement);
      expect(measurementFour).toBeDefined();

      expect(baseline).toEqual({
        name: "FieldWorks",
        size: "976211",
        stargazers_count: "11"
      });
      expect(measurementTwo).toEqual({
        repoAtPreviousMeasurement: {
          name: "FieldWorks",
          size: "976211",
          stargazers_count: "11"
        }
      });
      expect(measurementThree).toEqual({
        repoAtPreviousMeasurement: {
          repoAtPreviousMeasurement: {
            name: "FieldWorks",
            size: "976211",
            stargazers_count: "11"
          }
        }
      });
      expect(measurementFour).toEqual({
        name: "FieldWorks",
        size: "976211",
        stargazers_count: "11"
      });

      measurementFour.updateFromDiff("-  \"size\": 73634,\n+  \"size\": 74210,\n");
      expect(baseline.size + "").toEqual("976211");
      expect(measurementFour.size + "").toEqual("74210");
    });

    it("should stop if no previous measurement is found", function() {
      var baseline = new Repository();
      var measurementTwo = {
        repoAtPreviousMeasurement: baseline
      };
      var measurementThree = {
        repoAtPreviousMeasurement: measurementTwo
      };
      var measurementFour = {
        repoAtPreviousMeasurement: measurementThree
      };
      expect(baseline).toEqual({});
      expect(measurementTwo).toEqual({
        repoAtPreviousMeasurement: {}
      });
      expect(measurementThree).toEqual({
        repoAtPreviousMeasurement: {
          repoAtPreviousMeasurement: {}
        }
      });
      expect(measurementFour).toEqual({
        repoAtPreviousMeasurement: {
          repoAtPreviousMeasurement: {
            repoAtPreviousMeasurement: {}
          }
        }
      });

      measurementFour = Repository.fillFromLastKnownMeasurement(measurementFour.repoAtPreviousMeasurement);

      expect(baseline).toEqual({});
      expect(measurementTwo).toEqual({
        repoAtPreviousMeasurement: {}
      });
      expect(measurementThree).toEqual({
        repoAtPreviousMeasurement: {
          repoAtPreviousMeasurement: {}
        }
      });
      expect(measurementFour).toEqual({});

      expect(measurementFour).toBeDefined();
      expect(measurementFour.size).toBeUndefined();
      measurementFour.updateFromDiff("-  \"size\": 73634,\n+  \"size\": 74210,\n");
      expect(measurementFour.size + "").toEqual("74210");
    });


  });

});
