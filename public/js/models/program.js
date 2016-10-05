define(
    [
        'knockout',
        './modal/add-op',
        './unaryoperation',
        './naryoperation',
        './stream',
        '../lib/knockout.mapping'
    ],
    function (ko,
              OperatorModal,
              unaryoperation,
              NAryOperation,
              stream) {

    class Program {
        constructor(connectionHandler, jsplumb, id) {
            var self = this;
            this.connectionHandler = connectionHandler;
            this.id = id;
            this.jsplumb = jsplumb;

            this.sensors = ko.observableArray();
            this.streams = ko.observableArray();
            this.naryoperators = ko.observableArray();
            this.unaryoperators = ko.observableArray();
            this.helpers = ko.observableArray();
            this.selectedStream = ko.observable();
            this.selectedOperator = ko.observable();
            this.modal = ko.observable();
            this.availableOperators = ko.observableArray()
                .extend({ required: true });
            this.actuators = ko.observableArray();
            this.availableActuators = ko.observableArray();
            this.availableSensors = ko.observableArray();

            this.boxes = ko.computed(function () {
                return this.streams()
                           .concat(this.sensors())
                           .concat(this.actuators());
            }, this);

            this.operators = ko.computed(function () {
                return this.naryoperators()
                           .concat(this.unaryoperators())
            }, this);

            this.afterAddStream = function(element) {
                var data = ko.dataFor(element);
                stream(jsplumb, connectionHandler, data);

                // because sometimes operators arrive before streams
                // are rendered, we check again here
                var unconnectedIn = data.in().filter(
                    (item) => !item.connected()
                );

                unconnectedIn.forEach(function (operation) {
                    unaryoperation(operation, jsplumb);
                });

                var unconnectedOut = data.out().filter(
                    (operation) => !operation.connected()
                );

                unconnectedOut.forEach(function (operation) {
                    unaryoperation(operation, jsplumb);
                });
            };

            this.afterAddUnaryOperator = function(element) {
                var data = ko.dataFor(element);
                unaryoperation(data, jsplumb);
            };

            this.afterAddNAryOperator = function(element) {
                var data = ko.dataFor(element);
                var operation = new NAryOperation(
                    jsplumb,
                    connectionHandler,
                    data
                );
                operation.nary();
            };

            this.addOperator = function(stream) {
                self.modal(new OperatorModal(self.connectionHandler, self));
                self.modal().originStream(stream);
                return true;
            };

            this.addStream  = function(stream) {
                var msg = {
                    x: Math.round($('#editor-container').width()/2),
                    y: Math.round($('#editor-container').height()/2),
                    type: "stream",
                    action: "add",
                    sensorId: stream.id,
                    name: stream.name
                };
                connectionHandler.transmitter.addStream(msg);
            };

            this.removeStream = function(stream) {
                connectionHandler.transmitter.removeStream(stream.id());
            };

            this.removedStream = function(stream) {
                function remove(needle, haystack) {
                    var stream = haystack().find(
                        (item) => item.id() === needle.id
                    );
                    if (stream !== undefined) {
                        jsplumb.detachAllConnections(
                            $('#stream' + stream.id())
                        );
                        haystack.remove(stream);
                        return true;
                    }
                    return false;
                }

                return remove(stream, this.streams) ||
                       remove(stream, this.actuators) ||
                       remove(stream, this.sensors);
            };

            this.operatorClicked = function(operator) {
                self.selectedOperator(operator);
                self.modal(
                    new OperatorModal(self.connectionHandler, self, operator)
                );
                return true;
            };

            this.addInForNAry = function (operationdata) {
                var operation = new NAryOperation(
                    jsplumb,
                    connectionHandler,
                    operationdata
                );
                operation.addInForNAry();
            };

            this.hideAllMenus = function () {
                this.streams().forEach(function(stream) {
                    stream.menuVisible(false);
                })
            };
        }

        findStreamById(id) {
            return this.boxes().find(
                (element) => element.id() == id
            );
        }

        findHelperByName(name) {
            for (var i = 0; i < this.helpers().length; i++) {
                var helper = this.helpers()[i];
                if (helper.name() == name) {
                    return helper;
                }
            }
            return null;
        }

        findActuatorById(id) {
            return this.availableActuators().find(
                (actuator) => actuator.id == id
            );
        }

        findActuatorByName(name) {
            for (var i = 0; i < this.availableActuators().length; i++) {
                var actuator = this.availableActuators()[i];
                if (actuator.name == name) {
                    return actuator;
                }
            }
            return null;
        }

        addStreamToModel(stream) {
            var target = null;

            var streamToAdd = ko.mapping.fromJS(stream);
            streamToAdd.program = this;
            streamToAdd.menuVisible = ko.observable(false);

            if (stream.sensorName != null) {
                streamToAdd.streamClass = "sensor";
                target = this.sensors;
            } else if (stream.actuatorName != null) {
                streamToAdd.streamClass = "actuator";
                target = this.actuators;
            } else {
                streamToAdd.streamClass = "stream";
                target = this.streams;
            }

            streamToAdd.xpx = ko.computed(() => streamToAdd.x() + "px");
            streamToAdd.ypx = ko.computed(() => streamToAdd.y() + "px");

            streamToAdd.in = ko.computed(function () {
                return this.operators().filter(
                    (operator) => operator.destination() == streamToAdd.id()
                );
            }, this);
            streamToAdd.out = ko.computed(function () {
                return this.operators().filter(
                    (operator) => operator.source() == streamToAdd.id()
                );
            }, this);
            streamToAdd.actuatorInstance = ko.computed(function () {
                if (streamToAdd.actuatorId!==undefined) {
                    return this.findActuatorById(streamToAdd.actuatorId());
                } else {
                    return null;
                }

            }, this);
            target.push(streamToAdd);
        }

        updateStreamInModel(stream) {
            var streamInModel = this.findStreamById(stream.id);
            streamInModel.name(stream.name);
        }

        addOperationToModel(operation) {
            var sourceStream = operation.source;
            var destinationStream = operation.destination;
            if (operation.name != "combinator") {
                var operatorModel = ko.mapping.fromJS(operation);

                operatorModel.connected = ko.observable(false);
                operatorModel.lambdaName = ko.observable(operation.lambdaName);

                operatorModel.lambdaOption = ko.computed(function () {
                        return this.lambdaName() != null ? "helper" : "lambda"
                    },
                    operatorModel
                );

                operatorModel.label = ko.computed(function() {
                    return this.lambdaName() != null ?
                        this.name() + "(" +  this.lambdaName() + ")"
                        : this.name();
                }, operatorModel);

                operatorModel.helper = ko.computed(
                    () => operatorModel.lambdaName() != null ?
                            this.helpers().find(
                                (element) => element.id() == operation.lambdaId
                            )
                            : null
                    , this);

                operatorModel.sourceInstance = ko.computed(function() {
                    if (operatorModel.source() != null) {
                        return this.findStreamById(operatorModel.source())
                    }
                    return null;
                }, this);

                operatorModel.destinationInstance = ko.computed(function() {
                    if (operatorModel.destination() != null) {
                        return this.findStreamById(operatorModel.destination())
                    }
                    return null;
                }, this);

                operatorModel.selectedActuator = ko.computed(function() {
                        if (operation.name != 'subscribe') {
                            return null;
                        }
                        var destination = operatorModel.destinationInstance();
                        return destination ?
                            destination.actuatorInstance() :
                            null;
                    },
                    this
                );

                this.unaryoperators.push(operatorModel);
            } else {
                var found = false;
                for (var index in this.naryoperators()) {
                    var operatorFromList = this.naryoperators()[index];
                    if (operatorFromList.id == operation.id) {
                        found = true;
                    }
                }
                operation.source = sourceStream;
                operation.destination = destinationStream;
                operation.connected = ko.observable(true);
                if (!found) {
                    operation.xpx = ko.computed(() => operation.x + "px");
                    operation.ypx = ko.computed(() => operation.y + "px");

                    this.naryoperators.push(operation);
                } else {
                    this.addInForNAry(operation);
                }
            }
        }
    }

    return Program;
});