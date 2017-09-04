var MongoClient = require('mongodb').MongoClient;
var _db = null;
var config = require('./config');

function connectToDb(callback) {
    MongoClient.connect(
        'mongodb://'/* + config.db_username + ':' + config.db_password + '@'*/ + config.db_server + ':' + config.db_port + '/' + config.db_database,
        function(err, db) {
            db = _db;
            callback(err, db);
        }
    )
}

function getDb() {
    if(_db !== null) {
        return _db;
    } else {
        console.err('Call to getDb() before connectToDb()');
    }
}

module.exports = {
    connectToDb: connectToDb,
    getDb: getDb,
};
