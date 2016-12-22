define(['knockout', './Operation'], function(ko, Operation) {

        class SubscribeOperation extends Operation
        {
            constructor(operationModule,
                        availableOperationsModule,
                        streamModule,
                        id,
                        source,
                        destination)
            {
                super(operationModule,
                      availableOperationsModule,
                      streamModule,
                      id,
                      source,
                      destination);
                this.name("subscribe");
                this.selectedOutputModule = ko.observable(
                    destination ? this.destinationInstance.actuator : null
                );

                super.initLabel();
            }

            copy() {
                return new SubscribeOperation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.id(),
                    this.source(),
                    this.destination()
                );
            }

            getCreateMessage() {
                var base = super.getCreateMessage();
                base.actuatorId = this.selectedOutputModule().id();
                base.name = this.selectedOutputModule().name();
                return base;
            }

            getUpdateMessage() {
                let base = super.getUpdateMessage();

                base.actuatorId = this.selectedOutputModule().id();

                return base;
            }

            modal() {
                super.modal();
                this.outputStreamName = ko.observable(
                    this.selectedOutputModule()
                );
                return this;
            }
        }

        return SubscribeOperation
    }
);
