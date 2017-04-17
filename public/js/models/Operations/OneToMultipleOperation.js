define(['knockout', './Operation'], function (ko, operation) {
    "use strict";

    // fix me
    class OneToMultipleOperation extends Operation {
        constructor(operationModule,
                    availableOperationsModule,
                    streamModule,
                    programId,
                    id,
                    source,
                    destination) {
            super(operationModule,
                availableOperationsModule,
                streamModule,
                programId,
                id);

            this.source = ko.observable(source);

            this.sourceInstance = this.streamModule.get(
                this.source()
            );

            this.destination = ko.observable(destination);

            if (this.id()) {
                this.destinationInstance = this.streamModule.get(
                    this.destination()
                );
            }

            this.programId = ko.observable(programId);
        }

        copy() {
            return new OneToOneOperation(
                this.operationModule,
                this.availableOperationsModule,
                this.streamModule,
                this.id(),
                this.source(),
                this.destination()
            );
        }

        modal() {
            if (!this.id()) {
                this.action = "Add operation";
                this.outputStreamName = ko.observable();
            } else {
                this.action = "Edit operation";

                this.outputStreamName = ko.observable(
                    this.destinationInstance.name()
                );
            }
            this.outputStreamName.extend({required: true});
            this.selectedOperation = this.name();

            return this;
        }

        getBaseMessage() {
            return {
                type: "operation",
                sourceId: this.source(),
                name: this.outputStreamName(),
                programId: this.programId(),
                operation: this.name(),
                id: this.id()
            };
        }

        getCreateMessage() {
            var baseMsg = this.getBaseMessage();
            baseMsg.action = "add";
            baseMsg.x = this.calculateX(this.sourceInstance);
            baseMsg.y = this.calculateY(this.sourceInstance);
            return baseMsg;
        }

        calculateX(source) {
            let xOffsetFromStream = $("#stream" + source.id()).width() / 2;
            return xOffsetFromStream + source.x();
        }

        calculateY(source) {
            return source.y() + 100;
        }

        getUpdateMessage() {
            var baseMsg = this.getBaseMessage();
            baseMsg.action = "update";
            baseMsg.x = this.destinationInstance.x();
            baseMsg.y = this.destinationInstance.y();
            baseMsg.sourceId = this.sourceInstance.id();
            baseMsg.destinationId = this.destinationInstance.id();
            return baseMsg;
        }
    }

    return OneToOneOperation;

});