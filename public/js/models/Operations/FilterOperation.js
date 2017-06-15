define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {
    class FilterOperation extends OneToOneOperation {
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

        this.name("filter");
        this.suffix("Filtered");
        this.initLabel();
      }

      copy() {
        return new FilterOperation(
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
    }

    return FilterOperation
  }
);