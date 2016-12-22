define(['knockout', './Operation'], function(ko, Operation) {

        class TimestampOperation extends Operation {
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

                this.name("timestamp");

                super.initLabel();
            }

            copy() {
                return new TimestampOperation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.id(),
                    this.source(),
                    this.destination()
                );
            }

            modal() {
                super.modal();
                if (!this.id()) {
                    this.outputStreamName = ko.observable(
                        this.sourceInstance.name() + "Timestamped"
                    );
                }
                return this;
            }
        }

        return TimestampOperation
    }
);