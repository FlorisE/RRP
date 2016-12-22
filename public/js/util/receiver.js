define(
    [
        'knockout',
        './modules/HelperModule',
        './modules/StreamModule',
        './modules/SensorModule'
    ],
    function(ko,
             HelperModule,
             StreamModule,
             SensorModule) {
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
                        StreamModule.add(
                            record.id,
                            record.name,
                            record.x,
                            record.y,
                            this.programModel
                        );
                        break;
                    case 'stream|update':
                        var stream = StreamModule.get(record.id);
                        stream.name = record.name;
                        stream.x = record.x;
                        stream.y = record.y;
                        StreamModule.update(record.id, stream);
                        break;
                    case "stream|remove":
                        this.removeStream(record);
                        break;
                    case 'operation|add':
                        this.programModel().addOperationToModel(record);
                        break;
                    case 'lambda|add':
                        HelperModule.add(
                            record.id,
                            record.name,
                            record.body
                        );
                        break;
                    case 'lambda|update':
                        var helper = HelperModule.get(record.id);
                        helper.name = record.name;
                        helper.body = record.body;
                        HelperModule.update(record.id, helper);
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
            if (sensor.parameterName != null) {
                SensorModule.add(
                    sensor.id,
                    sensor.name
                );
            } else {
                var existingSensor = SensorModule.get(sensor.id);
                if (existingSensor) {
                    existingSensor.parameters.set(
                        sensor.parameterId,
                        {
                            name: sensor.parameterName,
                            type: sensor.parameterType,
                            id: sensor.parameterId
                        }
                    )
                } else {
                    SensorModule.add(
                        sensor.id,
                        sensor.name,
                        [
                            [
                                sensor.parameterId,
                                {
                                    name: sensor.parameterName,
                                    type: sensor.parameterType,
                                    id: sensor.parameterId
                                }
                            ]

                        ]
                    );
                }
            }
        }

        addOperations(record) {
            record.operations.forEach(
                (operation) => this.programModel().availableOperations.push(
                    {
                        name: operation,
                        fields: operationTypes[operation]
                    }
                )
            );
        }


    }

    return Receiver;
});