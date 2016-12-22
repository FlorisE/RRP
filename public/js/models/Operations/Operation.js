define(['knockout'], function (ko) {

        class Operation {
            constructor(operationModule,
                        availableOperationsModule,
                        streamModule,
                        id,
                        source,
                        destination) {
                this.operationModule = operationModule;
                this.availableOperationsModule = availableOperationsModule;
                this.streamModule = streamModule;
                this.id = ko.observable(id);
                this.source = ko.observable(source);
                this.destination = ko.observable(destination);
                this.name = ko.observable(); // this should be set by an
                                             // implementing class

                this.sourceInstance = this.streamModule.get(
                    this.source()
                );

                if (this.id()) {
                    this.destinationInstance = this.streamModule.get(
                        this.destination()
                    );
                }

                this.validationGroup = ko.observableArray([this.destination]);

                this.errors = ko.computed(
                    () => this.validationGroup(this.validationGroup())
                );
            }

            initLabel() {
                this.label = ko.computed(function () {
                    return this.getLabel();
                }, this);
            }

            getLabel() {
                return this.name();
            }

            validate() {
                if (this.errors().length > 0) {
                    this.errors.showAllMessages();
                    return false;
                }
                return true;
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
                this.validationGroup.push(this.outputStreamName);
                this.selectedOperation = this.name();

                return this;
            }

            copy() {
                return new Operation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.id(),
                    this.source(),
                    this.destination()
                );
            }

            getBaseMessage() {
                return {
                    type: "operation",
                    sourceId: this.source(),
                    name: this.outputStreamName(),
                    programId: this.sourceInstance.program.id(),
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

            save() {
                if (!this.validate()) {
                    return;
                }

                if (this.id()) { // update
                    this.operationModule.saveUpdated(
                        this.getUpdateMessage(),
                        () => $('#add-op').modal('hide')
                    );
                } else { // add
                    this.operationModule.saveNew(
                        this.getCreateMessage(),
                        () => $('#add-op').modal('hide')
                    );
                }
            }
        }

        return Operation
    }
);