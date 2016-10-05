var mappers = require('./mappers');
var senderModule = require('./sender');
var streamModule = require('./stream');
var sensorModule = require('./sensor');
var actuatorModule = require('./actuator');
var operatorModule = require('./operator');
var helperModule = require('./helper');
var uuid = require('node-uuid');

class Program {
    constructor(id, io, session) {
        this.id = id;
        this.io = io;
        this.session = session;
        this.maps = mappers.Mappers;
    }

    add(msg) {
        var cypher = `CREATE (n:Program { name: '${msg.name}', 
                                          uuid: '${uuid.v4()}'}) 
                      RETURN n.uuid as id, n.name as name`;
        return this.session.run(cypher).catch(
            function(error) {
                console.log(error);
            }
        ).then(
            (results) =>
                this.io.emit(
                    this.id,
                    results.records.map(this.maps.mapProgram)
                )
        );
    }

    getAll(msg) {
        this.session.run(
            "MATCH (n:Program) " +
            "RETURN n.uuid as id, n.name as name"
        ).then(
            (results) =>
                this.io.emit(
                    this.id,
                    results.records.map(this.maps.mapProgram)
                )
        ).catch(function(error) {
            console.log(error);
        });
    }

    get(msg) {
        if (!msg) {
            throw "Message required";
        }

        var programId = msg.id;
        var logwrapper = (location) => (msg) => console.log(`${location}: ${msg}`);

        var stream = new streamModule.Stream(this.id, this.io, this.session);
        var sensor = new sensorModule.Sensor(this.id, this.io, this.session);
        var actuator = new actuatorModule.Actuator(this.id, this.io, this.session);
        var operator = new operatorModule.Operator(this.id, this.io, this.session);
        var helper = new helperModule.Helper(this.id, this.io, this.session);

        sensor.getFromDb().then(
            sensor.sendToClient(),
            logwrapper("sensors")
        ).then(
            stream.getFromDb(programId),
            logwrapper("sensors")
        ).then(
            stream.sendToClient(),
            logwrapper("streams")
        ).then(
            actuator.getFromDb(programId),
            logwrapper("streams")
        ).then(
            actuator.sendToClient(programId),
            logwrapper("actuators")
        ).then(
            operator.getFromDbWithLambda(programId),
            logwrapper("actuators")
        ).then(
            operator.sendToClient(),
            logwrapper("relations")
        ).then(
            operator.getFromDbWithHelper(programId),
            logwrapper("relations")
        ).then(
            operator.sendToClient(),
            logwrapper("composite relations")
        ).then(
            helper.getFromDb(),
            logwrapper("composite relations")
        ).then(
            helper.sendToClient(),
            logwrapper("lambdas")
        ).then(
            operator.getAvailableFromDb(),
            logwrapper("lambdas")
        ).then(
            operator.sendAvailableToClient(),
            logwrapper("available operators")
        );
    }
}

module.exports = {
    Program: Program
};