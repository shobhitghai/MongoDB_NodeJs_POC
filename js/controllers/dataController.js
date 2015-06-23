var mysql = require("mysql");

function dataController(router, collection) {
    var self = this;
    self.handleRoutes(router, collection);
}

dataController.prototype.handleRoutes = function(router, collection) {
    var self = this;
    router.get("/", function(req, res) {
        res.json({
            "Message": "Hello World !"
        });
    });

    router.get("/getData", function(req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE ');

        //Find: retreive all the records and pass as json array

        // collection.find({}).toArray(function(err, docs) {
        //     if (err) {
        //         res.json({
        //             "Error": true,
        //             "Message": "Error executing query"
        //         });
        //     } else {
        //         console.log("Found the following records");
        //         // console.log(docs);
        //         res.end(JSON.stringify(docs));
        //     }
        // });

        //Count: retrieve the count of rows in db and thus low data size

        // collection.count({}, function(err, count) {
        //     if (err) {
        //         res.json({
        //             "Error": true,
        //             "Message": "Error executing query"
        //         });
        //     } else {
        //         console.log("Found the following records");
        //         // console.log(docs);
        //         res.end(count.toString());
        //     }
        // })

        // collection.count({"state" : "RI"}, function(err, count) {
        //     if (err) {
        //         res.json({
        //             "Error": true,
        //             "Message": "Error executing query"
        //         });
        //     } else {
        //         console.log("Found the following records");
        //         // console.log(docs);
        //         res.end(count.toString());
        //     }
        // })


        //Distinct: retrieve set of values on the basis of distinct key

        // collection.distinct('state', function(err, docs) {
        //     if (err) {
        //         res.json({
        //             "Error": true,
        //             "Message": "Error executing query"
        //         });
        //     } else {
        //         console.log("Found the following records");
        //         // console.log(docs);
        //         res.end(JSON.stringify(docs));
        //     }
        // })


    });

    //Total records
    router.get("/getTotalCount", function(req, res) {
        self._setResponseHeader(res);

        collection.count({}, function(err, count) {
            var obj = {};

            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing query"
                });
            } else {
                obj.data = count;
                obj.name = 'Total Zones Count'
                obj.desc = 'Number of records in table'

                res.end(JSON.stringify(obj));
            }
        })

    })

    //Total States
    router.get("/getContinentCount", function(req, res) {
        self._setResponseHeader(res);

        collection.distinct('continentName', function(err, docs) {
            var obj = {};

            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing query"
                });
            } else {
                obj.data = docs.length;
                obj.name = 'Total continent';
                obj.desc = 'Number of continents in world';

                res.end(JSON.stringify(obj));
            }
        })

    })

    //Total zone in State specified
    router.get("/getCountriesInContinent", function(req, res) {
        self._setResponseHeader(res);

        collection.count({
            "continentName": req.query.country
        }, function(err, count) {
            var obj = {};
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing query"
                });
            } else {
                obj.data = count;
                obj.name = 'Total Countries in';
                obj.desc = 'Number of country in ' + req.query.country;

                res.end(JSON.stringify(obj));
            }
        })

    })

    //Top 10 most populated zones
    router.get("/getMostPopulatedCities", function(req, res) {
        self._setResponseHeader(res);

        collection.find({}, {
            limit: 10
        }).sort({
            'population': -1
        }).toArray(function(err, docs) {
            var obj = {};

            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing query"
                });
            } else {
                obj.data = docs;
                obj.name = 'Total states Count';
                obj.desc = 'Number of states in US';

                res.end(JSON.stringify(obj));
            }
        })
    })

    router.get("/getCountiesByArea", function(req, res) {
        self._setResponseHeader(res);

        collection.find({}, {
            limit: 10
        }).sort({
            'areaInSqKm': -1
        }).toArray(function(err, docs) {
            var obj = {};

            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing query"
                });
            } else {
                obj.data = docs;
                res.end(JSON.stringify(obj));
            }
        })
    })
}

dataController.prototype._setResponseHeader = function(res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE ');
}

module.exports = dataController;
