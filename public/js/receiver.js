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
                        this.programModel().addStreamToModel(record);
                        break;
                    case 'stream|update':
                        this.programModel().updateStreamInModel(record);
                        break;
                    case "stream|remove":
                        this.removeStream(record);
                        break;
                    case 'operation|add':
                        this.programModel().addOperationToModel(record);
                        break;
                    case 'lambda|add':
                        this.addLambda(record);
                        break;
                    case 'lambda|update':
                        this.updateLambda(record);
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

        removeStream(stream) {
            var program = this.programModel();
            program.removedStream(stream);
        }

        addSensor(sensor) {
            sensor.out = ko.observableArray();
            this.programModel().availableSensors.push(sensor);
        }

        addProgram(record) {
            this.viewModel.programs.push(record);
        }

        addOutputModule(record) {
            this.programModel().availableActuators.push(record);
        }

        addOperations(record) {
            record.operations.forEach(
                (operator) => this.programModel().availableOperators.push(
                    {
                        name: operator,
                        fields: operatorTypes[operator]
                    }
                )
            );
        }

        addLambda(record) {
            this.programModel().helpers.push({
                id: ko.observable(record.id),
                name: ko.observable(record.name),
                body:  ko.observable(record.body)
            });
        }

        updateLambda(record) {
            var helpers = this.programModel().helpers();
            for (var i = 0; i < helpers.length; i++) {
                var helper = helpers[i];
                if (helper.id() == record.id) {
                    helper.name(record.name);
                    helper.body(record.body);
                    break;
                }
            }
        }
    }

    return Receiver;
});