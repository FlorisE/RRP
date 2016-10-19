var Stream = require('./stream');
var Sensor = require('./sensor');
var Actuator = require('./actuator');
var Operator = require('./operator');
var Helper = require('./helper');
var uuid = require('node-uuid');

class Program {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.logwrapper = (location) => (msg) => {
            console.log(`${location}: ${msg}`);
        };
    }

    add(msg, callback) {
        var cypher = `CREATE (n:Program { name: '${msg.name}', 
                                          uuid: '${uuid.v4()}'}) 
                      RETURN n.uuid as id, n.name as name`;
        return this.session.run(cypher).catch(
            function(error) {
                console.log(error);
            }
        ).then(
            (results) => {
                this.io.emit(
                    this.id,
                    results.records.map(this._mapProgram)
                );
                if (callback) {
                    callback();
                }
            },
            this.logwrapper("addprogram")
        );
    }

    getAll(msg, callback) {
        this.session.run(
            "MATCH (n:Program) " +
            "RETURN n.uuid as id, n.name as name"
        ).then(
            (results) => {
                this.io.emit(
                    this.id,
                    results.records.map(this._mapProgram)
                );
                if (callback) {
                    callback();
                }
            },
            this.logwrapper("programs")
        );
    }

    get(msg) {
        if (!msg) {
            throw "Message required";
        }

        var programId = msg.id;

        var stream = new Stream(this.id, this.io, this.session);
        var sensor = new Sensor(this.id, this.io, this.session);
        var actuator = new Actuator(this.id, this.io, this.session);
        var operator = new Operator(this.id, this.io, this.session);
        var helper = new Helper(this.id, this.io, this.session);

        sensor.getFromDb().then(
            sensor.sendToClient(),
            this.logwrapper("sensors")
        ).then(
            stream.getFromDb(programId),
            this.logwrapper("sensors")
        ).then(
            stream.sendToClient(),
            this.logwrapper("streams")
        ).then(
            actuator.getFromDb(programId),
            this.logwrapper("streams")
        ).then(
            actuator.sendToClient(programId),
            this.logwrapper("actuators")
        ).then(
            operator.getFromDbWithBody(programId),
            this.logwrapper("actuators")
        ).then(
            operator.sendToClient(),
            this.logwrapper("relations")
        ).then(
            operator.getFromDbWithHelper(programId),
            this.logwrapper("relations")
        ).then(
            operator.sendToClient(),
            this.logwrapper("composite relations")
        ).then(
            helper.getFromDb(),
            this.logwrapper("composite relations")
        ).then(
            helper.sendToClient(),
            this.logwrapper("helpers")
        ).then(
            operator.getAvailableFromDb(),
            this.logwrapper("helpers")
        ).then(
            operator.sendAvailableToClient(),
            this.logwrapper("available operators")
        );
    }

    _mapProgram(record) {
        return {
            type: "program",
            action: "add",
            id: record.get("id"),
            name: record.get("name")
        }
    }
}

module.exports = Program;