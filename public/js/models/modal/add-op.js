define(['knockout'], function (ko) {
    class Modal {
        constructor(connectionHandler, program, editOperator = null) {
            var self = this;
            this.editOperator = editOperator;
            this.connectionHandler = connectionHandler;
            this.lambdaTypes = {
                "filter": ["item", "Boolean"],
                "map": ["item", "Any type"]
            };
            this.programId = program.id;

            if (editOperator != null) {
                this.action = "Edit operator";
                this.selectedOperator = ko.observable(
                    program.availableOperators().find(
                        (operator) => operator.name == editOperator.name()
                    )
                );
                this.selectedOutputModule = ko.observable(editOperator.selectedActuator());

                this.lambda = ko.observable(editOperator.lambda ? editOperator.lambda() : null);

                if (editOperator.rate != null) {
                    this.rate = ko.observable(editOperator.rate());
                }

                this.originStream = ko.observable(editOperator.sourceInstance());

                if (editOperator.helper != null) {
                    this.selectedHelper = ko.observable(editOperator.helper());
                }

                if (editOperator.lambdaOption != null) {
                    this.lambdaOption = ko.observable(editOperator.lambdaOption());
                }

                this.destinationStream = ko.observable(
                    editOperator.destinationInstance()
                );

                this.outputStreamName = ko.observable(
                    editOperator.destinationInstance().name()
                );

            } else {
                this.action = "Add operator";
                this.selectedOperator = ko.observable();
                this.selectedOutputModule = ko.observable();
                this.lambda = ko.observable();
                this.rate = ko.observable();
                this.originStream = ko.observable();
                this.outputStreamName = ko.observable();
                this.selectedHelper = ko.observable();
                this.lambdaOption = ko.observable();
            }

            // Computed
            this.activeFields = ko.computed(function () {
                var op = this.selectedOperator();
                return op ? operatorTypes[op.name] : null;
            }, this);
            //noinspection JSUnusedGlobalSymbols
            this.lambdaInput = ko.computed(() => this.getLambdaInOrOut(0));
            //noinspection JSUnusedGlobalSymbols
            this.lambdaOutput = ko.computed(() => this.getLambdaInOrOut(1));

            // Visible
            //noinspection JSUnusedGlobalSymbols
            this.rateVisible = this.visibleForField("rate");
            //noinspection JSUnusedGlobalSymbols
            this.lambdaVisible = this.visibleForField("lambda");
            //noinspection JSUnusedGlobalSymbols
            this.outputModuleVisible = this.visibleForField("output-module");
            //noinspection JSUnusedGlobalSymbols
            this.outputStreamVisible = this.visibleForField("output-stream");

            // Active
            //noinspection JSUnusedGlobalSymbols
            this.lambdaActive = ko.computed(
                () => this.lambdaOption() == "lambda",
                this
            );
            //noinspection JSUnusedGlobalSymbols
            this.helperActive = ko.computed(
                () => this.lambdaOption() == "helper",
                this
            );
        }

        visibleForField(field) {
            return ko.computed(function () {
                var fields = this.activeFields();
                return fields ? fields.indexOf(field) >= 0 : false;
            }, this);
        }

        getLambdaInOrOut(index) {
            var op = this.selectedOperator();
            var lambdaType = op ? this.lambdaTypes[op.name] : null;
            return lambdaType ? lambdaType[index] : null;
        }

        save(form) {
            var data = ko.dataFor(form);

            var msg = {
                x: data.originStream().x() + 100,
                y: data.originStream().y() + 100,
                sourceId: data.originStream().id(),
                operator: data.selectedOperator().name,
                programId: data.programId
            };

            switch (data.selectedOperator().name) {
                case "timestamp":
                    msg.name = data.outputStreamName();
                    break;
                case "map":
                case "filter":
                    msg.name = data.outputStreamName();
                    if (this.lambdaActive() && data.lambda != null) {
                        msg.lambda = data.lambda();
                    } else if (this.helperActive()) {
                        msg.helper = data.selectedHelper().id();
                    }
                    break;
                case "sample":
                    msg.name = data.outputStreamName();
                    msg.rate = data.rate();
                    break;
                case "subscribe":
                    msg.name = data.selectedOutputModule().name;
                    msg.actuatorId = data.selectedOutputModule().id;
                    break;
                default:
                    msg = null;
                    console.log(data.selectedOperator().name);
            }

            if (this.editOperator == null) {
                this.connectionHandler.transmitter.addOperator(msg);
            } else {
                msg.destinationId = data.destinationStream().id;
                this.connectionHandler.transmitter.updateOperator(msg);
            }

            $('#add-op').modal('hide');
        };
    }

    return Modal;
});