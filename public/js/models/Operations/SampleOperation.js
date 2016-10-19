define(['knockout', './Operation'], function(ko, Operation) {

        class SampleOperation extends Operation
        {
            constructor(operationModule,
                        availableOperationsModule,
                        streamModule,
                        id,
                        source,
                        destination,
                        rate)
            {
                super(operationModule,
                      availableOperationsModule,
                      streamModule,
                      id,
                      source,
                      destination);
                this.rate = ko.observable(rate).extend({ required: true });
                this.name("sample");
                this.validationGroup.push(this.rate);
            }

            copy() {
                return new SampleOperation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.id(),
                    this.source(),
                    this.destination(),
                    this.rate()
                );
            }

            modal() {
                super.modal();
                if (!this.id()) {
                    this.outputStreamName = ko.observable(
                        this.sourceInstance.name() + "Sampled"
                    );
                }
                return this;
            }

            getCreateMessage() {
                var base = super.getCreateMessage();
                base.rate = this.rate();
                return base;
            }

            getUpdateMessage() {

            }
        }

        return SampleOperation
    }
);