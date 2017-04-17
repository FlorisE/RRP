var ModuleFactory = require('../util/ModuleFactory');
var OperationModuleFactory = require('../util/OperationModuleFactory');
const logwrapper = require('../util/logwrapper');

class ProgramModule {
    constructor(dao, sender) {
        this.dao = dao;
        this.sender = sender;
    }

    add(msg, callback) {
        return this.dao.add(msg.name, callback);
    }

    loadAll(msg, callback) {
        this.dao.all().then(
            (programs) => {
                programs.forEach(
                    (program) => {
                        this.sender.send(
                            {
                                type: "program",
                                action: "add",
                                id: program.id,
                                name: program.name,
                                neo4jId: program.neo4jId
                            },
                            callback
                        )
                    }
                )
            },
            logwrapper("ProgramModule.loadAll")
        );
    }

    get(id) {
        let promise = new Promise(
            (resolve, reject) => this.dao.single(id, resolve, reject)
        ).catch(logwrapper("ProgramModule.get"));
        return promise;
    }

    delete(msg, callback) {
        let promise = new Promise(
            (resolve, reject) => this.dao.remove(msg.id, resolve, reject)
        ).then(
            function() {
                if (callback) callback();
            },
            logwrapper("ProgramModule.delete")
        );
        return promise;
    }

    load(msg) {
        if (!msg) {
            throw "Message required";
        }

        let programId = msg.id;

        let moduleFactory = new ModuleFactory(this.dao.session, this.dao.sender);
        let omFactory = new OperationModuleFactory(this.dao.session, this.dao.sender);

        var stream = moduleFactory.getModule("Stream");
        var sensor = moduleFactory.getModule("Sensor");
        var actuator = moduleFactory.getModule("Actuator");
        var operation = moduleFactory.getModule("Operation");
        var helper = moduleFactory.getModule("Helper");
        var complexOperation = omFactory.getOperationModule("HelperOrBodyOperation");

        let pmLogwrapper = (message) => logwrapper("ProgramModule.load: " + message);

        sensor.getFromDb().then(
            sensor.sendAddMultiple.bind(sensor),
            pmLogwrapper("get sensors")
        ).then(
            actuator.getFromDb(programId),
            pmLogwrapper("send sensors")
        ).then(
            actuator.sendToClient(programId),
            pmLogwrapper("get actuators")
        ).then(
            stream.getFromDb(programId),
            pmLogwrapper("send actuators")
        ).then(
            stream.sendToClient(),
            pmLogwrapper("get streams")
        ).then(
            complexOperation.getOperations(programId),
            pmLogwrapper("send streams")
        ).then(
            operation.sendToClient(),
            pmLogwrapper("get relations")
        ).then(
            helper.getAll.bind(helper),
            pmLogwrapper("send relations")
        ).then(
            helper.sendToClient(),
            pmLogwrapper("get helpers")
        ).then(
            operation.getAvailable(),
            pmLogwrapper("send helpers")
        ).then(
            operation.sendAvailableToClient(),
            pmLogwrapper("get available operations")
        ).catch(
            pmLogwrapper("send available operations")
        );
    }

    loadSensors(sensor) {
        return sensor.getFromDb().then(
            sensor.sendToClient(),
            logwrapper("sensors")
        );
    }

    loadActuators(programId, actuator) {
        return actuator.getFromDb(programId)().then(
            actuator.sendToClient(programId),
            logwrapper("actuators")
        );
    }

    loadStreams(programId, stream) {
        return stream.getFromDb(programId)().then(
            stream.sendToClient(),
            logwrapper("streams")
        );
    }

    loadOperations(programId, complexOperation, operation) {
        return complexOperation.getOperations(programId)().then(
            operation.sendToClient(),
            logwrapper("ProgramModule.loadOperations")
        );
    }

    loadHelpers(helper) {
        return helper.getAll.bind(helper)().then(
            helper.sendToClient(),
            logwrapper("helpers")
        );
    }

    loadAvailableOperations(operation) {
        return operation.getAvailable()().then(
            operation.sendAvailableToClient(),
            logwrapper("available operations")
        );
    }

    loadResource(msg) {
        if (!msg) {
            throw "Message required";
        }

        let programId = msg.id;

        let moduleFactory = new ModuleFactory(this.dao.session, this.dao.sender);
        let omFactory = new OperationModuleFactory(this.dao.session, this.dao.sender);

        var stream = moduleFactory.getModule("Stream");
        var sensor = moduleFactory.getModule("Sensor");
        var actuator = moduleFactory.getModule("Actuator");
        var operation = moduleFactory.getModule("Operation");
        var helper = moduleFactory.getModule("Helper");
        var complexOperation = omFactory.getOperationModule("ComplexOperation");

        switch(msg.resource) {
            case "sensors":
                this.loadSensors(sensor);
                break;
            case "actuators":
                this.loadActuators(programId, actuator);
                break;
            case "streams":
                this.loadStreams(programId, stream);
                break;
            case "operations":
                this.loadOperations(programId, complexOperation, operation);
                break;
            case "helpers":
                this.loadHelpers(helper);
                break;
            case "availableOperations":
                this.loadAvailableOperations(operation);
                break;
            default:
                console.log("Unrecognized resource: " + msg.resource);
        }
    }
}

module.exports = ProgramModule;
