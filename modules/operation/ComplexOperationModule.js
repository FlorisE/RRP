const FilterOperation = require('../../models/operation/FilterOperation');
const MapOperation = require('../../models/operation/MapOperation');
const logwrapper = require('../../util/logwrapper');
const Stream = require('../../models/Stream');

class ComplexOperationModule {
    constructor(dao, sender, moduleFactory) {
        this.dao = dao;
        this.streamModule = moduleFactory.getModule("Stream");
        this.programModule = moduleFactory.getModule("Program");
        this.helperModule = moduleFactory.getModule("Helper");
    }

    add(msg, callback) {
        let program = this.programModule.get(msg.programId);
        let source = this.streamModule.get(msg.sourceId);
        let operationName = msg.operation;

        Promise.all([program, source]).then(
            ([program, source]) => {
                let destination = Stream.create(
                    msg.name, msg.x, msg.y, program
                );

                let operation;
                if (operationName === "filter") {
                    operation = FilterOperation.create(
                        source, destination, program
                    );
                } else if (operationName === "map") {
                    operation = MapOperation.create(
                        source, destination, program
                    );
                } else {
                    throw "Unknown operation: " + operationName;
                }

                this.streamModule.save(destination).then(
                    () => this.addWithHelperOrBody(
                        msg.helper, msg.body, operation, callback
                    )
                );
            }
        ).catch(logwrapper("ComplexOperationModule.add"));
    }

    addWithHelperOrBody(helperId, body, operation, callback) {
        if (helperId != null) {
            this.helperModule.get(helperId).then(
                (helper) => {
                    operation.addHelper(helper);

                    this.dao.addHelper(operation, callback);
                }
            );
        } else {
            operation.addBody(body);
            this.dao.addBody(operation, callback);
        }
    }

    update(type, msg, callback) {
        // possible changes:
        // - output name
        // OR
        // - body changed
        // - helper changed
        // - helper to body
        // XOR
        // - body to helper
        this.dao.get(
            msg.id,
            (operation) => {
                if (msg.name && msg.name != operation.destination.name) {
                    operation.destination.name = msg.name;
                }

                let mutation;

                if (operation.body && msg.helperId)  // body to helper
                {
                    mutation = this.dao.bodyToHelper(operation.id, msg.helperId, type);
                }
                else if (operation.body && msg.body)  // body changed
                {
                    mutation = this.dao.setBody(operation.id, msg.body);
                }
                else if (operation.helper && msg.body)  // helper to body
                {
                    mutation = this.dao.helperToBody(operation.id, msg.body, type);
                }
                else if (operation.helper && msg.helperId)  // helper changed
                {
                    mutation = this.dao.setHelper(operation.id, msg.helperId);
                }

                if (mutation) {
                    mutation.then(
                        () => this.saveMutation(msg, operation, callback)
                    );
                } else {
                    this.saveMutation(msg, operation, callback);
                }
            }
        );
    }

    saveMutation(msg, operation, callback) {
        if (msg.helperId) {
            this.dao.saveHelper(operation, callback);
        } else {
            this.dao.saveBody(operation, callback);
        }
    }

    getOperationWithHelper(programId, operationId) {
        return this.dao.getOperationWithHelper(programId, operationId);
    }

    getOperationWithBody(programId, operationId) {
        return this.dao.getOperationWithBody(programId, operationId);
    }
}

module.exports = ComplexOperationModule;
