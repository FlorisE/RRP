define(['knockout', './Operation'], function(ko, Operation) {

        class FilterOperation extends Operation {

            constructor(operationModule,
                        availableOperationsModule,
                        streamModule,
                        helperModule,
                        id,
                        source,
                        destination,
                        body,
                        helperId,
                        helperName)
            {
                super(operationModule,
                      availableOperationsModule,
                      streamModule,
                      id,
                      source,
                      destination);

                this.helperModule = helperModule;
                this.body = ko.observable(body);
                this.helperId = ko.observable(helperId);
                this.helperName = ko.observable(helperName);
                this.name("filter");
                if (this.id() && this.helperId()) {
                    this.lambdaOption = ko.observable("helper");
                } else {
                    this.lambdaOption = ko.observable("body");
                }
                this.selectedHelper = ko.observable(helperModule.get(helperId));
            }

            copy() {
                return new FilterOperation(
                    this.operationModule,
                    this.availableOperationsModule,
                    this.streamModule,
                    this.helperModule,
                    this.id(),
                    this.source(),
                    this.destination(),
                    this.body(),
                    this.helperId(),
                    this.helperName()
                )
            }

            modal() {
                super.modal();
                if (!this.id()) {
                    this.outputStreamName = ko.observable(
                        this.sourceInstance.name() + "Filtered"
                    );
                }
                return this;
            }

            getCreateMessage() {
                var base = super.getCreateMessage();
                if (this.lambdaOption() == "helper") {
                    base.helper = this.selectedHelper().id();
                } else {
                    base.body = this.body();
                }
                return base;
            }

            getUpdateMessage() {
                var base = super.getUpdateMessage();
                if (this.lambdaOption() == "helper") {
                    base.helper = this.selectedHelper().id();
                } else {
                    base.body = this.body();
                }
                return base;
            }
        }

        return FilterOperation
    }
);