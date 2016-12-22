define([
    'util/ObservableMapToKOObservableArray',
    'util/ObservableArrayToKOObservableArray',
    './modal/helper_modal',
    'util/JSPlumbInstance',
    './Operations/OperationFactory'],
    function (mtoa,
              atoa,
              HelperModal,
              instance,
              OperationFactory)
    {

    class Editor {

        constructor (editorModule,
                     programModule,
                     helperModule,
                     sensorModule,
                     actuatorModule,
                     sensorStreamModule,
                     availableOperationsModule)
        {
            var self = this;

            this.loadedProgram = ko.observable();
            this.programModal = ko.validatedObservable();
            this.helperModal = ko.observable();
            this.insertSensorModal = ko.observable();
            this.operationModal = ko.observable();

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

            this.availableSensors = ko.observableArray();
            mtoa(sensorModule, this.availableSensors);

            this.availableActuators = ko.observableArray();
            mtoa(actuatorModule, this.availableActuators);

            this.availableOperations = ko.observableArray();
            atoa(availableOperationsModule, this.availableOperations);

            this.addInitial = function (initial) {
                console.log(initial);
                return true;
            };

            this.loadProgram = function(program) {
                self.loadedProgram(program);
                document.title = program.name();
                instance.reset();
                self.load();
                self.programModule.load(program.id());
                return true;
            };

            this.addProgramModal = function() {
                var program = self.programModule.instantiate();
                self.programModal(program);
                return true;
            };

            this.addHelperModal = function() {
                var helper = self.helperModule.instantiate();
                self.helperModal(helper);
                helper.modal();
                return true;
            };

            this.editHelperModal = function(helper) {
                self.helperModal(helper);
                helper.modal();
                return true;
            };

            this.createSensorInstance = function(sensor) {
                var container = document.getElementById('editor-container');
                self.sensorStreamModule.create(
                    sensor.name(),
                    Math.round(container.width()/2),
                    Math.round(container.height()/2),
                    self.loadedProgram().id(),
                    sensor.id(),
                    sensor.parameters()
                );
            };

            $('#add-op').on('show.bs.modal', function (event) {
                var element = $(event.relatedTarget);
                var data = ko.dataFor(element[0]);
                self.loadedProgram().hideAllMenus();
                self.operationModal(
                    self.editorModule.createOperationModal(data, element)
                );
            });
        }

        updateSensorInstance(stream) {
            this.insertSensorModal(stream.copy().modal());
            $('#insert-sensor').modal();
        }

        load() {
            this.helperModule.clear();
            this.sensorModule.clear();
            this.actuatorModule.clear();
            this.availableOperationsModule.clear();
        }
    }

    return Editor;
});
