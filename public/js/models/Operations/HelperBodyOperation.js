define(['knockout', './Operation'], function (ko, Operation) {
        class HelperBodyOperation extends Operation {
            constructor(operationModule,
                        availableOperationsModule,
                        streamModule,
                        helperModule,
                        id,
                        source,
                        destination,
                        body,
                        helperId,
                        helperName) {
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

                this.bodyOrHelper = ko.observable(
                    this.helperName() ? "helper" : "body"
                );

                this.hasHelper = ko.computed(
                    () => this.bodyOrHelper() === "helper"
                );

                this.hasBody = ko.computed(
                    () => this.bodyOrHelper() === "body"
                );

                this.selectedHelper = ko.observable(helperModule.get(helperId));

                super.initLabel();
            }

            update(id, body, source, destination, helperId, helperName) {
                this.id(id);
                this.body(body);
                this.source(source);
                this.destination(destination);
                this.helperId(helperId);
                this.helperName(helperName);
                this.bodyOrHelper(this.helperName() ? "helper" : "body");
                return this;
            }

            getLabel() {
                if (this.bodyOrHelper() == "helper") {
                    return `${this.name()} (${this.helperName()})`;
                } else {
                    return `${this.name()} (${this.body()})`;
                }
            }

            modal(type) {
                super.modal();
                if (!this.id()) {
                    this.outputStreamName = ko.observable(
                        this.sourceInstance.name() + type
                    );
                }
                return this;
            }

            getCreateMessage() {
                var base = super.getCreateMessage();
                if (this.bodyOrHelper() == "helper") {
                    base.helper = this.selectedHelper().id();
                } else {
                    base.body = this.body();
                }
                return base;
            }

            getUpdateMessage() {
                var base = super.getUpdateMessage();
                if (this.bodyOrHelper() == "helper") {
                    base.helperId = this.selectedHelper().id();
                } else {
                    base.body = this.body();
                }
                return base;
            }
        }

        return HelperBodyOperation
    }
);