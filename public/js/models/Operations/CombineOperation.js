define([
    'knockout',
    '../../util/JSPlumbInstance',
    '../../util/dragger',
    './ManyToOneOperation'
  ],
  function (ko,
            jsplumb,
            Dragger,
            ManyToOneOperation) {

    class CombineOperation extends ManyToOneOperation {
      constructor(operationModule,
                  availableOperationsModule,
                  streamModule,
                  editorModule,
                  programModule,
                  helperModule,
                  id,
                  programId,
                  sources,
                  destination,
                  x,
                  y,
                  body,
                  helperId,
                  helperName) {
          super(
            operationModule,
            availableOperationsModule,
            streamModule,
            editorModule,
            programModule,
            id,
            programId,
            sources,
            destination,
            x,
            y,
            true,
            helperModule,
            body,
            helperId,
            helperName
          );
        this.availableOperationsModule = availableOperationsModule;
        this.name("combine");
        this.suffix("Combined");
        super.initLabel();
      }

      copy() {
        return new CombineOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.editorModule,
          this.programModule,
          this.helperModule,
          this.id(),
          this.programId(),
          this.sources(),
          this.destination(),
          this.x(),
          this.y(),
          this.body(),
          this.helperId(),
          this.helperName()
        );
      }

      modal() {
        super.modal();
        if (!this.id()) {
          this.outputStreamName = ko.observable(
            this.sourceInstances.length > 0
              ? this.sourceInstances[0].name() + "Combined"
              : "Combined"
          );
        }
        return this;
      }
    }

    return CombineOperation
  }
);