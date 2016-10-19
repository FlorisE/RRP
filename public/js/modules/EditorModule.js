define(
    [
        'util/ConnectionHandler',
        'models/Editor',
        './Module',
        'models/Operations/OperationFactory'
    ],
    function (ConnectionHandler,
              Editor,
              Module,
              OperationFactory) {
    class EditorModule extends Module {

        constructor(d) {
            super(d);
            this.editor = null;
        }

        getEditor() {
            if (this.editor == null) {
                this.editor = new Editor(
                    this,
                    this.programModule,
                    this.helperModule,
                    this.sensorModule,
                    this.actuatorModule,
                    this.sensorStreamModule,
                    this.availableOperationsModule
                );
            }

            return this.editor;
        }

        load() {
            this.editor.load();
        }

        createOperatorModal(data, element) {
            if (data.constructor.name === "String") {
                var stream = ko.dataFor(
                    element.parentsUntil(".box").parent()[0]
                );
                return (new OperationFactory(this.d)).create(data, {
                    source: stream.id()
                }).modal();
            } else {
                return data.copy().modal();
            }
        }
    }

    return EditorModule;
});