define(
  [
    'knockout',
    './unaryoperation',
    './naryoperation',
    '../util/box',
    '../util/ObservableMapToKOObservableArray',
    '../util/JSPlumbInstance',
    './Operations/Operation',
    '../lib/knockout.mapping'
  ],
  function (ko,
            unaryoperation,
            NAryOperation,
            box,
            mtoa,
            instance) {

    class Program {
      constructor(streamModule,
                  operationsModule,
                  editorModule,
                  programModule,
                  id,
                  name,
                  neo4jId) {
        if (!streamModule || !operationsModule || !editorModule || !programModule) {
          throw "Missing injected modules";
        }

        var self = this;
        this.id = ko.observable(id);
        this.name = ko.observable(name).extend({required: true});
        this.neo4jId = ko.observable(neo4jId);

        this.streamModule = streamModule;
        this.operationsModule = operationsModule;
        this.editorModule = editorModule;
        this.programModule = programModule;

        this.editor = editorModule.getEditor();

        this.streams = ko.observableArray();

        //operationsModule.program = this;
        this.operations = ko.observableArray();

        mtoa(operationsModule, this.operations);
        this.naryoperations = ko.computed(function () {
          return this.operations().filter(
            (operation) => operation["sources"]
          )
        }, this);

        this.unaryoperations = ko.computed(function () {
          return this.operations().filter(
            (operation) => operation["source"]
          )
        }, this);


        this.selectedStream = ko.observable();
        this.selectedOperation = ko.observable();
        this.availableOperations = ko.observableArray()
          .extend({required: true});

        // knockout
        this.afterAddStream = function (element) {
          var stream = ko.dataFor(element);
          stream.draw();
        };

        this.afterAddUnaryOperation = function (element) {
          var data = ko.dataFor(element);
          unaryoperation(data, instance);
        };

        this.afterAddNAryOperation = function (element) {
          var data = ko.dataFor(element);
          data.draw();
        };

        this.editStream = function (stream) {
          if (stream.streamClass == "sensor") {
            self.editor.updateSensorInstance(stream);
          } else if (stream.streamClass === "actuator") {
            self.editor.updateActuatorInstance(stream);
          } else {
            console.log(stream.in());
          }
        };

        this.removeStream = function (stream) {
          connectionHandler.transmitter.removeStream(stream.id());
        };

        this.removedStream = function (stream) {
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
          this.streams().forEach(function (stream) {
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
          var operationModel = ko.mapping.fromJS(operation);

          operationModel.connected = ko.observable(false);
          operationModel.helperName = ko.observable(operation.helperName);

          operationModel.bodyOrHelper = ko.observable(
            this.helperName() !== null ? "helper" : "body"
          );

          operationModel.hasHelper = ko.computed(
            () => operationModel.bodyOrHelper() === "helper"
          );

          operationModel.hasBody = ko.computed(
            () => operationModel.bodyOrHelper() === "body"
          );

          operationModel.label = ko.computed(function () {
            return this.helperName() != null ?
              this.name() + "(" + this.helperName() + ")"
              : this.name();
          }, operationModel);

          operationModel.helper = ko.computed(
            () => operationModel.helperName() != null ?
              this.helpers().find(
                (element) => element.id() == operation.lambdaId
              )
              : null
            , this);

          operationModel.sourceInstance = ko.computed(function () {
            if (operationModel.source() != null) {
              return this.findStreamById(operationModel.source())
            }
            return null;
          }, this);

          operationModel.destinationInstance = ko.computed(function () {
            if (operationModel.destination() != null) {
              return this.findStreamById(operationModel.destination())
            }
            return null;
          }, this);

          operationModel.selectedActuator = ko.computed(function () {
              if (operation.name != 'subscribe') {
                return null;
              }
              var destination = operationModel.destinationInstance();
              return destination ?
                destination.actuatorInstance() :
                null;
            },
            this
          );

          this.unaryoperations.push(operationModel);
        } else {
          var found = false;
          for (var index in this.naryoperations()) {
            var operationFromList = this.naryoperations()[index];
            if (operationFromList.id == operation.id) {
              found = true;
            }
          }
          operation.source = sourceStream;
          operation.destination = destinationStream;
          operation.connected = ko.observable(true);
          if (!found) {
            operation.xpx = ko.computed(() => operation.x + "px");
            operation.ypx = ko.computed(() => operation.y + "px");

            this.naryoperations.push(operation);
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

      save() {
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
