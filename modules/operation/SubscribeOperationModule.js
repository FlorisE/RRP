const uuid = require("node-uuid");
const logwrapper = require("../../util/logwrapper");
const SubscribeOperation = require("../../models/operation/SubscribeOperation");
const ActuatorStream = require("../../models/ActuatorStream");
const BaseOperationModule = require("./BaseOperationModule");

class SubscribeOperationModule extends BaseOperationModule {

    constructor(dao, sender, moduleFactory) {
        super(dao, sender, moduleFactory);
        this.actuatorModule = moduleFactory.getModule("Actuator");
        this.actuatorStreamModule = moduleFactory.getModule("ActuatorStream");
    }

    add(msg, callback) {
        let program = this.programModule.get(msg.programId),
            source = this.streamModule.get(msg.sourceId),
            actuator = this.actuatorModule.get(msg.actuatorId);

        Promise.all([program, source, actuator]).then(
            ([program, source, actuator]) => {
                let destination = this.getDestination(
                    msg, program, actuator
                );

                let operation = this.createOperationFromMsg(
                    source, destination, program
                );

                this.actuatorStreamModule.save(destination).then(
                    () => this.dao.add(
                        operation, callback
                    )
                );
            }
        ).catch(logwrapper("SubscribeOperationModule.add"));
    }

    update(msg, callback) {
        return this.dao.get(
            msg.id,
            (operation) => {
                if (operation.actuatorId !== msg.actuatorId) {
                    this.actuatorStreamModule.actuatorChangedTo(
                        operation.destination.id, msg.actuatorId,
                        operation.program.id, callback);
                }
            }
        );
    }

    getDestination(msg, program, actuator) {
        return ActuatorStream.create(
            msg.name, msg.x, msg.y, program, actuator, msg.parameters
        );
    }

    createOperationFromMsg(source, destination, program) {
        return SubscribeOperation.create(source, destination, program);
    }
}

module.exports = SubscribeOperationModule;
