define([
    '../util/ObservableMapToKOObservableArray',
    '../util/ObservableArrayToKOObservableArray',
    '../util/JSPlumbInstance',
    './Operations/OperationFactory',
    './Helper',
    './Operations/Operation',
    '../util/validation'
  ],
  function (mtoa,
            atoa,
            instance,
            OperationFactory,
            Helper,
            Operation) {

    class Editor {

      constructor(editorModule,
                  programModule,
                  helperModule,
                  sensorModule,
                  actuatorModule,
                  sensorStreamModule,
                  availableOperationsModule) {
        var self = this;

        this.loadedProgram = ko.observable();
        this.programModal = ko.observable();
        this.monitorModal = ko.observable();
        this.helperModal = ko.observable();
        this.insertSensorModal = ko.observable();
        this.insertActuatorModal = ko.observable();
        this.operationModal = ko.validatedObservable();

        this.editorModule = editorModule;
        this.programModule = programModule;
        this.helperModule = helperModule;
        this.sensorModule = sensorModule;
        this.actuatorModule = actuatorModule;
        this.sensorStreamModule = sensorStreamModule;
        this.availableOperationsModule = availableOperationsModule;

        this.programs = ko.observableArray();
        mtoa(programModule, this.programs);

        this.helpers = ko.observableArray();
        mtoa(helperModule, this.helpers);

        this.robots = ko.observableArray([{name: "Blue"}, {name: "Red"}, {name: "Freeza"}]);

        this.availableSensors = ko.observableArray();
        mtoa(sensorModule, this.availableSensors);

        this.availableActuators = ko.observableArray();
        mtoa(actuatorModule, this.availableActuators);

        this.availableOperations = ko.observableArray();
        atoa(availableOperationsModule, this.availableOperations);
        this.availableOperationNames = ko.computed(() => {
          return this.availableOperations().map((operation) => operation.name)
        });

        this.isRunning = ko.observable(false);
        this.running = ko.computed(this.isRunning);
        this.notRunning = ko.computed(() => !this.isRunning());

        this.addInitial = function (initial) {
          console.log(initial);
          return true;
        };

        this.loadProgram = function (program) {
          self.loadedProgram(program);
          document.title = program.name();
          instance.reset();
          self.load();
          self.programModule.load(program.id());
          return true;
        };

        this.startLoadedProgram = function () {
          let program = self.loadedProgram();
          let id = program.neo4jId();
          $.post(`/runtime/${id}`, function (result) {
            console.log(result);
          });
          this.isRunning(true);
        };

        this.restartLoadedProgram = function () {
          let program = self.loadedProgram();
          let id = program.neo4jId();
          $.ajax(`/runtime/${id}`, {
            complete: function (result) {
              console.log(result);
            },
            method: "PUT"
          });
          this.isRunning(true);
        };

        this.stopLoadedProgram = function () {
          let program = self.loadedProgram();
          let id = program.neo4jId();
          $.ajax(`/runtime/${id}`, {
            method: "DELETE"
          });
          this.isRunning(false);
        };

        this.addProgramModal = function () {
          var program = self.programModule.instantiate();
          self.programModal(program);
          return true;
        };

        this.confirmRemoveProgram = function () {
          self.programModule.requestRemove(
            self.loadedProgram().id(),
            function () {
              $('#confirm-remove-program').modal('hide');
              self.loadedProgram(null);
              document.title = "Reactive Robot Programming";
              instance.reset();
              return true;
            }
          );
          return true;
        };

        this.addHelperModal = function () {
          var helper = self.helperModule.instantiate();
          self.helperModal(helper);
          helper.modal();
          return true;
        };

        this.removeProgramModal = function () {
          return true;
        };

        this.editHelperModal = function (helperOrOperation) {
          if (helperOrOperation instanceof Helper) {
            self.helperModal(helperOrOperation);
            helperOrOperation.modal();
          } else if (helperOrOperation instanceof Operation) {
            self.helperModal(helperOrOperation.selectedHelper());
            helperOrOperation.selectedHelper().modal();
            $("#add-helper").modal({ backdrop: false });
          }
          return false;
        };

        this.createSensorInstance = function (sensor) {
          var container = $('#editor-container');
          self.sensorStreamModule.create(
            sensor.name(),
            Math.round(container.width() / 2),
            Math.round(container.height() / 2),
            self.loadedProgram().id(),
            sensor.id(),
            sensor.parameters()
          );
        };

        $('#add-op').on('show.bs.modal', function (event) {
          var element = $(event.relatedTarget);
          // only handle the click if the name is not jQuery
          // otherwise it will be handled by
          if (element[0] !== undefined) {
            var data = ko.dataFor(element[0]);
            self.loadedProgram().hideAllMenus();
            self.operationModal(
              self.editorModule.createOperationModal(data, element)
            );
          }
        });

        this.nonSensorOrphans = ko.computed(function () {
          var loadedProgram = this.loadedProgram();
          return loadedProgram ? loadedProgram.streams().filter(
              (stream) => stream.streamClass !== "sensor" &&
              stream.in().length === 0
            ) : [];
        }, this);

        this.monitor = function (stream) {
          return true;
        };
      }

      updateSensorInstance(stream) {
        this.insertSensorModal(stream.copy().modal());
        $('#insert-sensor').modal();
      }

      updateActuatorInstance(stream) {
        this.insertActuatorModal(stream.copy().modal());
        $('#insert-actuator').modal();
      }

      load() {
        this.sensorModule.clear();
        this.actuatorModule.clear();
        this.availableOperationsModule.clear();
      }
    }

    return Editor;
  });
