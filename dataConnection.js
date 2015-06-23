var application_root = __dirname,
    express = require("express"),
    mongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    bodyParser = require("body-parser"),
    dataController = require("./js/controllers/dataController.js");
    port = process.env.PORT || 3000;

var app = express();

function DataConnectionLayer() {
    var self = this;
    self.connectDB();
};

DataConnectionLayer.prototype.connectDB = function() {
    var self = this;

    var config_url = 'mongodb://db_admin:admin123@ds035290.mongolab.com:35290/db_node';

    mongoClient.connect(config_url, function(err, db) {

        if (err) {
            console.log(err);
            self.stop(err);
        } else {
            console.log("Connected correctly to server");
            var collection = db.collection('country');
            self.configureExpress(collection);
        }
    });
}

DataConnectionLayer.prototype.configureExpress = function(collection) {
    var self = this;
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    var router = express.Router();
    app.use('/api', router);
    var apiController = new dataController(router, collection);
    self.startServer();
}

DataConnectionLayer.prototype.startServer = function() {
    app.listen(port, function() {
        console.log("All right ! I am alive at Port." + port);
    });
}

DataConnectionLayer.prototype.stop = function(err) {
    console.log("ISSUE WITH MongoClient \n" + err);
    process.exit(1);
}

new DataConnectionLayer();
