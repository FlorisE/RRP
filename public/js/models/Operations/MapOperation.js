define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {
    class MapOperation extends OneToOneOperation {
      constructor(
        operationModule,
        availableOperationsModule,
        streamModule,
        helperModule,
        id,
        programId,
        source,
        destination,
        body,
        helperId,
        helperName,
        connection
      ) {
        super(
          operationModule,
          availableOperationsModule,
          streamModule,
          id,
          programId,
          source,
          destination,
          true,
          helperModule,
          body,
          helperId,
          helperName,
          connection
        );

        this.name("map");
        this.suffix("Mapped");
        this.initLabel();
      }

      copy() {
        return new MapOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.helperModule,
          this.id(),
          this.programId(),
          this.source(),
          this.destination(),
          this.body(),
          this.helperId(),
          this.helperName(),
          this.connection()
        )
      }

      modal() {
        super.modal();
        if (!this.id()) {
          this.outputStreamName = ko.observable(
            this.sourceInstance.name() + this.suffix()
          );
        }
        return this;
      }
    }

    return MapOperation
  }
);