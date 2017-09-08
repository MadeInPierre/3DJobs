var mysql = require('mysql');
var _db = null;
var config = require('./config');

function connectToDb(callback) {
    _db = mysql.createConnection({
        host: config.db_server,
        user: config.db_username,
        password: config.db_password,
        database: config.db_database,
    });

    _db.connect(function(err) {
        if(err) throw err;

        _db.config.queryFormat = function(query, values) {
            if (!values) return query;
            return query.replace(/\:(\w+)/g, function(txt, key) {
                if (values.hasOwnProperty(key)) {
                    return this.escape(values[key]);
                }
                return txt;
            }.bind(this));
        };

        callback(_db);
    });
}

function getDb() {
    if(_db !== null) {
        return _db;
    } else {
        console.error('Call to getDb() before connectToDb()');
    }
}

function insertJob(job, callback) {
    var db = getDb();

    var query = `INSERT INTO jobs(user_id, spool_id, description, weight, time_h, time_m, date)
                 VALUES(:user_id, :spool_id, :description, :weight, :time_h, :time_m, :date)`;

    db.query(query, job, function(err, results, fields) {
        var insertId = (err) ? null : results.insertId;
        callback(err, insertId);
    });
}

function getJobs(number, page, callback) {
    var db = getDb();

    var query = `SELECT
                    jobs.id AS id, jobs.description AS description, jobs.weight AS weight, time_h, time_m, date,
                    first_name, last_name,
                    spools.description AS spool_description,
                    spools.price / spools.weight * jobs.weight AS estimated_price
                 FROM jobs
                 JOIN users ON users.id = jobs.user_id
                 JOIN spools ON spools.id = jobs.spool_id`;

    db.query(query, [], function(err, results, fields) {
            if(err) throw err;

            callback(results);
    });
}

function insertUser(user, callback) {
    var db = getDb();

    var query = `INSERT INTO users(first_name, last_name)
                 VALUES(:first_name, :last_name)`;

    db.query(query, user, function(err, results, fields) {
        var insertId = (err) ? null : results.insertId;
        callback(err, insertId);
    });
}

function getUsers(callback) {
    var db = getDb();

    var query = `SELECT id, first_name, last_name FROM users;`;

    db.query(query, [], function(err, results, fields) {
        if(err) throw err;

        callback(results);
    })
}

function insertSpool(spool, callback) {
    var db = getDb();

    var query = `INSERT INTO spools(description, weight, price)
                 VALUES(:description, :weight, :price);`;

    db.query(query, spool, function(err, results, fields) {
        var insertId = (err) ? null : results.insertId;
        callback(err, insertId);
    });
}

function getSpools(callback, all=true) {
    var db = getDb();

    var where = '';
    if(!all) {
        where = ' WHERE finished = false';
    }

    var query = `SELECT id, description, weight, price, finished, price / weight AS price_per_gram FROM spools` + where + `;`;

    db.query(query, [], function(err, results, fields) {
        if(err) throw err;

        callback(results);
    })
}

function getSpool(id, callback) {
    var db = getDb();

    var query = `SELECT id, description, weight, price, finished, price / weight AS price_per_gram FROM spools WHERE id = :id;`;

    db.query(query, {id: id}, function(err, results, fields) {
        if(err) throw err;

        if(results.length == 0) {
            callback(false);
        }

        callback(results[0]);
    });
}

function markSpoolAsFinished(id, callback) {
    var db = getDb();

    var query = `UPDATE spools SET finished = true WHERE id = :id;`;

    db.query(query, {id: id}, function(err, results, fields) {
        if(err) throw err;

        callback(results.affectedRows);
    });
}

module.exports = {
    connectToDb: connectToDb,
    getDb: getDb,
    insertJob: insertJob,
    insertUser: insertUser,
    insertSpool: insertSpool,
    getJobs: getJobs,
    getUsers: getUsers,
    getSpools: getSpools,
    getSpool: getSpool,
    markSpoolAsFinished: markSpoolAsFinished,
};
