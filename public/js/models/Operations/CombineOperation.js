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
                  helperName,
                  connection) {
        super(operationModule,
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
          helperName,
          connection
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
          this.helperName(),
          this.connection()
        );
      }
    }

    return CombineOperation
  }
);