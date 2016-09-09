define(['knockout'], function(ko) {
    class Receiver {
        constructor(id, socket, viewModel, programModel) {
            this.id = id;
            this.viewModel = viewModel;
            this.programModel = programModel;
            socket.on(this.id, this.messageReceived.bind(this));
        }

        messageReceived(records) {
            for (var index in records) {
                var record = records[index];

                switch(record.type + "|" + record.action) {
                    case 'sensor|add':
                        this.addSensor(record);
                        break;
                    case 'program|add':
                        this.addProgram(record);
                        break;
                    case 'stream|add':
                        this.addStream(record);
                        break;
                    case "stream|remove":
                        this.removeStream(record);
                        break;
                    case 'operation|add':
                        this.addOperation(record);
                        break;
                    case 'lambda|add':
                        this.addLambda(record);
                        break;
                    case 'operations|add':
                        this.addOperations(record);
                        break;
                    case 'output_module|add':
                        this.addOutputModule(record);
                        break;
                    default:
                        console.log(record);
                }
            }
        }

        addStream(stream) {
            if (stream.sensorName == null) {
                stream.streamClass = "stream";
            } else {
                stream.streamClass = "sensor";
            }
            stream.xpx = ko.computed(() => stream.x + "px");
            stream.ypx = ko.computed(() => stream.y + "px");
            stream.menuVisible = ko.observable(false);
            stream.in = ko.observable();
            stream.out = ko.observableArray();
            this.programModel().streams.push(stream);
        }

        removeStream(stream) {
            var program = this.programModel();
            program.removedStream(stream);
        }

        addOperation(operation) {
            var program = this.programModel();
            var sourceStream = program.findStreamById(operation.source);
            var destinationStream = program.findStreamById(operation.destination);
            if (operation.name != "combinator") {

                var operatorModel = ko.observable({
                    id: operation.id,
                    name: ko.observable(operation.name),
                    lambdaName: ko.observable(operation.lambdaName),
                    source: sourceStream,
                    destination: destinationStream
                });

                operatorModel().label = ko.computed(function() {
                    if (this.lambdaName() != null) {
                        return this.name() + "(" +  this.lambdaName() + ")";
                    } else {
                        return this.name();
                    }
                }, operatorModel());

                sourceStream.out.push(operatorModel());
                destinationStream.in(operatorModel());

                program.unaryoperators.push(operatorModel);
            } else {
                var found = false;
                for (var index in program.naryoperators()) {
                    var operatorFromList = program.naryoperators()[index];
                    if (operatorFromList.id == operation.id) {
                        found = true;
                    }
                }
                operation.source = sourceStream;
                operation.destination = destinationStream;
                if (!found) {
                    operation.xpx = ko.computed(() => operation.x + "px");
                    operation.ypx = ko.computed(() => operation.y + "px");


                    destinationStream.in(operation);
                    program.naryoperators.push(operation);
                } else {
                    program.addInForNAry(operation);
                }
                sourceStream.out.push(operation);
            }
        }

        addSensor(sensor) {
            sensor.out = ko.observableArray();
            this.programModel().availableSensors.push(sensor);
        }

        addProgram(record) {
            this.viewModel.programs.push(record);
        }

        addOutputModule(record) {
            record.streamClass = 'actuator';
            record.xpx = ko.computed(() => record.x + "px");
            record.ypx = ko.computed(() => record.y + "px");
            record.menuVisible = ko.observable(false);
            record.in = ko.observable();
            this.programModel().actuators.push(record);
        }

        getAvailableOperator(operator) {
            return {
                name: operator,
                fields: operatorTypes[operator]
            };
        }

        addOperations(record) {
            record.operations.forEach(
                (operator) => this.programModel().availableOperators.push(
                    this.getAvailableOperator(operator)
                )
            );
        }

        addLambda(record) {
            this.programModel().helpers.push(record);
        }
    }

    return Receiver;
});