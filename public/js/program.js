define(
    [
        'knockout',
        'modal/add-op',
        'unaryoperation',
        'naryoperation',
        'stream'
    ],
    function (ko,
              Modal,
              unaryoperation,
              NAryOperation,
              stream) {

    class Program {
        constructor(connectionHandler, jsplumb) {
            var self = this;
            this.connectionHandler = connectionHandler;
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
            this.availableSensors = ko.observableArray();

            this.afterAddStream = function(element) {
                var data = ko.dataFor(element);
                stream(jsplumb, connectionHandler, data);
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
                self.modal(new Modal(self.connectionHandler, self));
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
                connectionHandler.transmitter.removeStream(stream.id);
            };

            this.removedStream = function(stream) {
                for (var i = 0; i < this.streams().length; i++) {
                    var streamInList = this.streams()[i];
                    if (streamInList.id === stream.id) {
                        jsplumb.detachAllConnections($('#stream' + streamInList.id));
                        this.streams.remove(streamInList);
                        break;
                    }
                }
            };

            this.operatorClicked = function(operator) {
                self.selectedOperator(operator);
                self.modal(new Modal(self, operator));
                return true;
            };

            this.addInForNAry = function (operationdata) {
                var operation = new NAryOperation(
                    jsplumb,
                    connectionHandler,
                    operationdata
                );
                operation.addInForNAry();
            }
        }

        findStreamById(id) {
            for (var i = 0; i < this.streams().length; i++) {
                var stream = this.streams()[i];
                if (stream.id === id) {
                    return stream;
                }
            }
            for (i = 0; i < this.actuators().length; i++) {
                var stream = this.actuators()[i];
                if (stream.id === id) {
                    return stream;
                }
            }
            return null;
        }
    }

    return Program;
});