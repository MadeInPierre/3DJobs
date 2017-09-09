var express = require('express');
var router = express.Router();
var db = require('../db');
var async = require('async');

/* GET home page. */
router.get('/', function(req, res, next) {
    async.parallel([
        function(callback) {
            db.getJobs(10, 1, function(jobs) {
                callback(null, jobs);
            });
        },
        function(callback) {
            db.getUsers(function(users) {
                callback(null, users);
            });
        },
        function(callback) {
            db.getSpools(function(spools) {
                callback(null, spools);
            }, false); // We only get non finished spools.
        }
    ], function(err, results) { // results = [[JOBS_ARRAY], [USERS_ARRAY], [SPOOLS_ARRAY]]
        if(err) throw err;

        res.render('index', {
            users: results[1],
            jobs: results[0],
            spools: results[2],
        });
    });
});


function _checkDate(y, m, d) {
    var date = new Date(y, m, d);
    if(y != date.getFullYear() || m != date.getMonth() || d != date.getDate()) {
        return false;
    }
    return date;
}

function _getPostParameter(req, name) {
    return (req.body[name] !== undefined) ? req.body[name] : undefined;
}
function _getPostIntParameter(req, name) {
    return (_getPostParameter(req, name) !== undefined) ? parseInt(_getPostParameter(req,name), 10) : undefined;
}

/* POST add a job. */
router.post('/add', function(req, res, next) {
    // We get the parameters from the request body
    var user_id = _getPostIntParameter(req, 'user_id');
    var first_name = _getPostParameter(req, 'first_name');
    var last_name = _getPostParameter(req, 'last_name');
    var y = _getPostParameter(req, 'y');
    var m = _getPostParameter(req, 'm');
    var d = _getPostParameter(req, 'd');
    var description = _getPostParameter(req, 'description');
    var spool_id = _getPostIntParameter(req, 'spool_id');
    var spool_description = _getPostParameter(req, 'spool_description');
    var spool_weight = _getPostIntParameter(req, 'spool_weight');
    var spool_price = _getPostIntParameter(req, 'spool_price') * 100 || 0; // Stored as € cents in DB
    var weight = _getPostIntParameter(req, 'weight');
    var time_h = _getPostIntParameter(req, 'time_h') || 0;
    var time_min = _getPostIntParameter(req, 'time_min') || 0;

    // Validation
    var errors = [];

    if(!user_id && (!first_name || !last_name)) {
        errors.push('You must provide the name of the user.');
    }
    if(!spool_id && (!spool_description || spool_price === undefined || !spool_weight)) {
        errors.push('You must provide the material used to print your job.');
    }

    var date = _checkDate(y, m, d);
    if(!date) {
        errors.push('The date you provided doesn\'t exist.');
    }
    if(!weight) {
        errors.push('You must provide the weight of your job.');
    }
    if(weight < 0) {
        errors.push('The weight can\'t be negative.');
    }
    if(time_h < 0 || time_min < 0) {
        errors.push('Time can\'t be negative.');
    }

    if(errors.length > 0) {
        res.status(400).json({
            errors: errors
        });

        return;
    }
    // We make sure that 1h130m is transformed into 3h10m
    while(time_min >= 60) {
        time_min -= 60;
        time_h += 1;
    }

    var return_err = function(err) {
        console.log(err);
        var err = new Error('Can\'t insert the job into the database. Please try again later.');
        err.status = 500;
        next(err);
    };

    var save_user = function(callback) {
        db.insertUser(user, function(err, inserted_id) {
            if(err) {
                return_err(err);
                return;
            }

            job.user_id = inserted_id;
            user.id = inserted_id;
            callback();
        });
    };

    var save_spool = function(callback) {
        db.insertSpool(spool, function(err, inserted_id) {
            if(err) {
                return_err(err);
                return;
            }

            spool.id = inserted_id;
            job.spool_id = inserted_id;
            job.estimated_price = spool.price / spool.weight * job.weight;
            callback();
        });
    };

    var save_job = function() {
        if(!job.user_id) {
            save_user(save_job);
            return;
        }
        if(!job.spool_id) {
            save_spool(save_job);
            return;
        }

        db.insertJob(job, function(err, inserted_id) {
            if(err) {
                return_err(err);
                return;
            } else {
                if(job.estimated_price === undefined) {
                    db.getSpool(job.spool_id, function(spool) {
                        if(spool) {
                            job.estimated_price = spool.price / spool.weight * job.weight;
                        }
                        return_response_ok();
                    });
                } else {
                    return_response_ok();
                }
            }
        });
    };

    var return_response_ok = function() {
        res.json({
            job: job,
            user: user || null,
            spool: spool || null,
        });
    }

    var user = (!user_id) ? { first_name: first_name, last_name: last_name, } : null;
    var spool = (!spool_id) ? { description: spool_description, weight: spool_weight, price: spool_price } : null;
    var job = {
        user_id: user_id,
        spool_id: spool_id,
        date: date,
        description: description,
        weight: weight,
        time_h: time_h,
        time_m: time_min,
    };

    save_job(job);
});

router.post('/mark_spool_as_finished', function(req, res, next) {
    var spool_id = _getPostIntParameter(req, 'spool_id');

    if(!spool_id) {
        res.status(404).send();
        return;
    }

    db.markSpoolAsFinished(spool_id, function(affected_rows) {
        if(affected_rows == 0) {
            res.status(404).send();
        } else {
            res.send();
        }
    });
});

module.exports = router;
