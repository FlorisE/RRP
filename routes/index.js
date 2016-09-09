var express = require('express');
var router = express.Router();
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost");
var programModule = require('../models/program');
var streamModule = require('../models/stream');

class Stream {
    constructor(item) {
        this.type = "stream";
        this.id = item.identity.low;
        this.name = item.properties.name;
        this.x = item.properties.x.low;
        this.y = item.properties.y.low
    }

    mapped() {
        return {
            type: "stream",
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y
        };
    }
}

class Operation {
    map(record) {
        return {
            type: "operation",
            name: record.name,
            source: record.source.low,
            destination: record.destination.low
        };
    }
}

class Samples extends Operation {
    map(record) {
        ret = super.map(record);
        ret.rate = record.rate.low;
        return ret;
    }
}

class Combine extends Operation {
    map(record) {
        ret = super.map(record);
        ret.id = record.id.low;
        ret.x = record.x.low;
        ret.y = record.y.low;
        return ret;
    }
}

class Map extends Operation {
    map(record) {
        ret = super.map(record);
        ret.lambda = record.lambda;
        return ret;
    }
}

class Filter extends Operation {
    map(record) {
        ret = super.map(record);
        ret.lambda = record.lambda;
        return ret;
    }
}

class Subscribe extends Operation {}

class Timestamp extends Operation {}

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

    var modules = {
        program: new programModule.Program(driver, res.io, req.id),
        stream: new streamModule.Stream(driver, res.io, req.id),
        //operator:
        //sensor:
    };

    function getDispatcher(type, action, msg) {
        var module = modules[type];

        if (!module) {
            throw `Module ${type} not found`;
        }

        var executor = module.getExecutor(action);

        if (!executor) {
            throw `Executor ${action} on ${type} not found`;
        }

        return executor.bind(module);
    }

    socket.on(req.id, function (msg) {
        logTime("Received " + msg.action);

        var dispatcher = getDispatcher(msg.type, msg.action, msg);

        dispatcher(msg);
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
