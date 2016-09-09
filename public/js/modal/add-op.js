define(['knockout'], function (ko) {
    class Modal {
        constructor(connectionHandler, viewModel, editOperator = null) {
            var self = this;
            this.editOperator = editOperator;
            this.connectionHandler = connectionHandler;
            this.lambdaTypes = {
                "filter": ["item", "Boolean"],
                "map": ["item", "Any type"]
            };

            if (editOperator != null) {
                this.selectedOperator = ko.observable(editOperator);
                this.selectedOutputModule = ko.observable();
                this.lambda = ko.observable(editOperator.lambda);
                this.rate = ko.observable(editOperator.rate);
                this.originStream = ko.observable();

                var streams = viewModel.streams();
                for (var i = 0; i < streams.length; i++) {
                    var stream = streams[i];
                    if (stream.id == editOperator.destination.id) {
                        this.outputStream = ko.observable(stream.name)
                            .extend({required: true});
                        break;
                    }
                }
            } else {
                this.selectedOperator = ko.observable();
                this.selectedOutputModule = ko.observable();
                this.lambda = ko.observable();
                this.rate = ko.observable();
                this.originStream = ko.observable();
                this.outputStream = ko.observable().extend({required: true});
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
                x: data.originStream().x + 100,
                y: data.originStream().y + 100,
                name: data.outputStream(),
                sourceId: data.originStream().id,
                operator: data.selectedOperator().name
            };

            switch (data.selectedOperator().name) {
                case "timestamp":
                    break;
                case "map":
                case "filter":
                    msg.lambda = data.lambda();
                    break;
                case "samples":
                    msg.rate = data.rate();
                    break;
                case "subscribe":

                    break;
                default:
                    msg = null;
                    console.log(data.selectedOperator().name);
            }

            if (this.editOperator == null) {
                this.connectionHandler.transmitter.addOperator(msg);
            } else {
                this.connectionHandler.transmitter.updateOperator(msg);
            }

            $('#add-op').modal('hide');
        };
    }

    return Modal;
});