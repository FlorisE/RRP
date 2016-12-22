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
                                name: program.name
                            },
                            callback
                        )
                    }
                )
            }
        );
    }

    get(id) {
        let promise = new Promise(
            (resolve, reject) => this.dao.single(id, resolve, reject)
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
        var complexOperation = omFactory.getOperationModule("ComplexOperation");

        sensor.getFromDb().then(
            sensor.sendToClient(),
            logwrapper("sensors")
        ).then(
            actuator.getFromDb(programId),
            logwrapper("sensors")
        ).then(
            actuator.sendToClient(programId),
            logwrapper("actuators")
        ).then(
            stream.getFromDb(programId),
            logwrapper("actuators")
        ).then(
            stream.sendToClient(),
            logwrapper("streams")
        ).then(
            complexOperation.getOperationWithBody(programId),
            logwrapper("streams")
        ).then(
            operation.sendToClient(),
            logwrapper("relations using body")
        ).then(
            complexOperation.getOperationWithHelper(programId),
            logwrapper("relations using body")
        ).then(
            operation.sendToClient(),
            logwrapper("relations using helper")
        ).then(
            helper.getAll.bind(helper),
            logwrapper("relations using helper")
        ).then(
            helper.sendToClient(),
            logwrapper("helpers")
        ).then(
            operation.getAvailable(),
            logwrapper("helpers")
        ).then(
            operation.sendAvailableToClient(),
            logwrapper("available operations")
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

    loadOperationsWithBody(programId, complexOperation, operation) {
        return complexOperation.getOperationWithBody(programId)().then(
            operation.sendToClient(),
            logwrapper("relations using body")
        );
    }

    loadOperationsWithHelper(programId, complexOperation, operation) {
        return complexOperation.getOperationWithHelper(programId)().then(
            operation.sendToClient(),
            logwrapper("relations using helper")
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
            case "operationsWithBody":
                this.loadOperationsWithBody(programId, complexOperation, operation);
                break;
            case "operationsWithHelper":
                this.loadOperationsWithHelper(programId, complexOperation, operation);
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
