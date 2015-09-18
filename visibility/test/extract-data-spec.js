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

          expect(repoStatsOverTime.measurementsList.length).toEqual(49);
          expect(repoStatsOverTime.measurementsList).toEqual([
            "fed94873566aacbcad628b27d669cb648da1e5f8",
            "e7691129cb3cd30b469b6aba93714a9eb3797027",
            "4ce355a67f213c560d0e1159f7ba8a7522b27fc4",
            "cd5c38f63ea94f4efe74f59e2ea4957ba9a032f5",
            "c846a2733a592177c382eadab467bdec9a58e1a0",
            "4015e53a3f6b3ea3f7bcab60f0d93cd731cc482f",
            "4083164bdf52bca74a0e53011a8696f20a593a86",
            "1e370dd497879270cfaaaf465813190845f6c317",
            "de55880e0bfb368538249d9d992983235dead79a",
            "d16aef2c6c325629f2ae6aeddfdff2fe86907209",
            "91d1d15d92e00399f20fe39fa1e39bb471f7542c",
            "d74cab68de3f8987166022ed209f62ca8065a0e6",
            "8c8de381a62b01c471b8957b5ade5c4aef3363de",
            "cbd24e7eaaee9eaac05fab834977159eb51beef3",
            "a55554d464c6202cf141def90c32278b96e0c367",
            "a3c82830c3f483fce1c3569c821fcaacda1f17c5",
            "c4994ee04664d39781ca6185a515a55d7c7b5520",
            "046740012157bd4de127e62db2d9f91c09b9dade",
            "cc796620328593b1944da75c709e42ea67147458",
            "f1405e2d0c936b7287007368bb04f14aa506cdbf",
            "16587256d25200446bdd1d9969aefc5bee045088",
            "69c7aad70fe531ca6d328f05164ea2af356ab3ff",
            "970b1db2887cdb0788d8b5579a73451c966569c6",
            "b7f565da14e4e9df19867b33075cb0507e89a8a7",
            "13da7de587cf1ea397fa5dfd5e35dbf796b2663a",
            "0f922502463a54aef7c1a76bc7d9c407647e8192",
            "fd633b7c08316b82b801adf786c019e48f5b8315",
            "3a047f8016b4a29cc4b78a0ec11d51813825b021",
            "c9d11a27669c760d9da1555aa3255775b24777aa",
            "a2453f2ec66e023ae8658ed046bbfcaf69ab7d94",
            "d31f1a66675421bf2978fc61d75b57996c41dce3",
            "46a9def4dbec1c71223c6006d07f03f45fb7606d",
            "0c3faa3625f9a32a3ef90287536ae7b9014bc478",
            "e07147ecf53e001d4b804041c34a4136784d9f41",
            "6517a7c3814aa0c9fe713217fa3c6ea34bfd10f4",
            "67ee758dc334764ac5d6450e4c7ce1934c6db06e",
            "5a10b8cf58d7b8fd6b5fd561e326fc241273b4d2",
            "2ae02ca7b0e20e24084b85fd916671727a937926",
            "1bebc24e9ed34c0b30e98bb5beab7ed82d636313",
            "53ba6f43bbc16f4cdb890617d69cc3afa3383288",
            "36ce22db09a1b37a41e3cad8d2e4d48b9d7afc1a",
            "0ee42907b80d9c00bdf3ecc70ce420a66fd988a1",
            "3aa715ea3d21892cd4e21da7b76a1296f37c3163",
            "27e3e0f6ceefae04c775f79fab9d54b20453e68d",
            "ffccb30853cbe050f10cd05659e34dec5374e4d0",
            "a88fcf15872a4ed6c44dd113e8479a9cca0910e9",
            "0719ec22585bdc0095999741f87041f7d30a395d",
            "6b1f14d837283864a77903207152bddcc0d7f37e",
            "d5b4c04a891f7314962d3e8899083c541558a8c7"
          ]);
          expect(repoStatsOverTime.repositoriesList.length).toEqual(2);

          expect(repoStatsOverTime.data["fed94873566aacbcad628b27d669cb648da1e5f8"]["AuToBI"].exportAsCSV())
            .toEqual(["AuToBI", 20071, 12, 12, "", 8]);
          expect(repoStatsOverTime.data["fed94873566aacbcad628b27d669cb648da1e5f8"]["BloomDesktop"].exportAsCSV())
            .toEqual(["BloomDesktop", 73499, 6, 6, 4, 12]);

          expect(repoStatsOverTime.data["d5b4c04a891f7314962d3e8899083c541558a8c7"]).toEqual(repoStatsOverTime.data["fed94873566aacbcad628b27d669cb648da1e5f8"]);
          expect(repoStatsOverTime.data["d5b4c04a891f7314962d3e8899083c541558a8c7"]).not.toBe(repoStatsOverTime.data["fed94873566aacbcad628b27d669cb648da1e5f8"]);

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
