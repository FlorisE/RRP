define(
  [
    'models/Editor',
    './Module',
    'models/Operations/OperationFactory'
  ],
  function (Editor,
            Module,
            OperationFactory) {
    class EditorModule extends Module {

      constructor(d, connectionHandler) {
        super(d, connectionHandler);
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

      createOperationModal(data, element) {
        if (data.constructor.name === "Object") {
          var stream = ko.dataFor(
            element.parentsUntil(".box").parent()[0]
          );
          return (
              new OperationFactory(this.d)
          ).create(
            data.name, {
              sources: [stream.id()],
              destinations: [],
              programId: stream.program.id(),
              x: stream.x(),
              y: stream.y()
            }
          ).modal();
        } else {
          return data.copy().modal();
        }
      }
    }

    return EditorModule;
  });
