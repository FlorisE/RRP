define(
    [
        'knockout',
        './modal/add-op',
        './unaryoperation',
        './naryoperation',
        '../util/box',
        '../util/ObservableMapToKOObservableArray',
        '../util/ConnectionHandler',
        '../util/JSPlumbInstance',
        './Operations/Operation',
        '../lib/knockout.mapping'
    ],
    function (ko,
              OperatorModal,
              unaryoperation,
              NAryOperation,
              box,
              mtoa,
              ConnectionHandler,
              instance,
              Operation) {

        class Program {
            constructor(streamModule,
                        operationsModule,
                        editorModule,
                        programModule,
                        id,
                        name)
            {
                if (!streamModule ||
                    !operationsModule ||
                    !editorModule ||
                    !programModule)
                {
                    throw "Missing injected modules";
                }

                var self = this;
                this.id = ko.observable(id);
                this.name = ko.observable(name).extend({ required: true });

                this.streamModule = streamModule;
                this.operationsModule = operationsModule;
                this.editorModule = editorModule;
                this.programModule = programModule;

                this.editor = editorModule.getEditor();

                this.streams = ko.observableArray();

                //operationsModule.program = this;
                this.operations = ko.observableArray();

                mtoa(operationsModule, this.operations);
                this.naryoperators = ko.computed(function () {
                    return this.operations().filter(
                        (operation) => operation["sources"]
                    )
                }, this);

                this.unaryoperators = ko.computed(function () {
                    return this.operations().filter(
                        (operation) => operation["source"]
                    )
                }, this);

                this.selectedStream = ko.observable();
                this.selectedOperator = ko.observable();
                this.availableOperators = ko.observableArray()
                    .extend({ required: true });
                this.availableActuators = ko.observableArray();

                /*this.operators = ko.computed(function () {
                    return this.naryoperators()
                        .concat(this.unaryoperators())
                }, this);*/

                // knockout
                this.afterAddStream = function(element) {
                    var stream = ko.dataFor(element);
                    stream.draw();
                };

                    /*
                    box(instance, data);

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
                };*/

                this.afterAddUnaryOperator = function(element) {
                    var data = ko.dataFor(element);
                    unaryoperation(data, instance);
                };

                this.afterAddNAryOperator = function(element) {
                    var data = ko.dataFor(element);
                    data.draw();
                };

                this.addOperator = function(stream) {
                    self.operatorModal(new Operation());
                    self.operatorModal().source(stream.id());
                    return true;
                };

                this.editStream = function(stream) {
                    if (stream.streamClass == "sensor") {
                        self.editor.updateSensorInstance(stream);
                    } else {
                        console.log(stream.in());
                    }
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

                this.hideAllMenus = function () {
                    this.streams().forEach(function(stream) {
                        stream.menuVisible(false);
                    })
                };

                this.isValid = ko.computed(function () {
                    this.name();
                    return this.name.isValid();
                }, this);
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

            load() {
                this.streamModule.clear();
                this.operationsModule.clear();
                this.editorModule.load();
            }

            modal() {
                return this;
            }

            validate() {
                var errors = ko.validation.group([this.name]);
                if (errors().length > 0) {
                    errors.showAllMessages();
                    return false;
                }
                return true;
            }

            save () {
                if (!this.validate()) {
                    return;
                }

                if (this.id()) { // update

                } else { // add
                    this.programModule.create(
                        this.name(),
                        () => $('#add-program').modal('hide')
                    );
                }
            }
        }

        return Program;
    }
);