var express = require('express');
var router = express.Router();
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost",
                          neo4j.auth.basic("neo4j", "neo4j"));
var programModule = require('../models/program');
var streamModule = require('../models/stream');
var lambdaModule = require('../models/lambda');
var operatorModule = require('../models/operator');

function clientHandler(req, res, socket) {

    function logTime(msg=null) {
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        var ms = date.getMilliseconds();
        var dateTime = h + ":" + m + ":" + ms;
        if (msg == null) {
            console.log(dateTime);
        } else {
            console.log(dateTime + ": " + msg);
        }
    }

    var modules = new Map([
        ["program", programModule.Program],
        ["stream", streamModule.Stream],
        ["lambda", lambdaModule.Lambda],
        ["operator", operatorModule.Operator]
    ]);

    var moduleFactory = (() => {
        var moduleInstances = new Map();
        function getModuleInstance(key) {
            if (!moduleInstances.has(key)) {
                var target = modules.get(key);
                moduleInstances["key"] = new target(req.id, res.io, driver.session());
            }
            return moduleInstances["key"];
        }
        return getModuleInstance;
    })();

    function getDispatcher(type, action, session) {
        var module = moduleFactory(type, session);

        if (!module) {
            throw `Module ${type} not found`;
        }

        var executor = module[action];

        if (!executor) {
            throw `Executor ${action} on ${type} not found`;
        }

        return executor.bind(module);
    }

    socket.on(req.id, function (msg) {
        logTime("Received " + msg.action);

        var session = driver.session();
        getDispatcher(msg.type, msg.action, session)(msg);
        session.close();
    });

    socket.on('error', function(error) {
        console.log(error);
    });
}

/* GET home page. */
router.get('/', function (req, res, next) {
    title = "test";
    res.io.on('connection', function (socket) {
        clientHandler(req, res, socket);
    });
    res.render('index', {title: title, id: req.id});
});

module.exports = router;
