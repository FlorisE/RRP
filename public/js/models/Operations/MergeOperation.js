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

    class MergeOperation extends ManyToOneOperation {
      constructor(operationModule,
                  availableOperationsModule,
                  streamModule,
                  editorModule,
                  programModule,
                  id,
                  programId,
                  sources,
                  destination,
                  x,
                  y) {
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
          false
        );
        this.availableOperationsModule = availableOperationsModule;
        this.name("merge");
        this.suffix("Merged");
        super.initLabel();
      }

      copy() {
        return new MergeOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.editorModule,
          this.programModule,
          this.id(),
          this.programId(),
          this.sources(),
          this.destination(),
          this.x(),
          this.y()
        );
      }
    }

    return MergeOperation
  }
);