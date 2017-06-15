define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class TimestampOperation extends OneToOneOperation {
      constructor(
        operationModule,
        availableOperationsModule,
        streamModule,
        id,
        programId,
        source,
        destination,
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
          false,
          null,
          null,
          null,
          null,
          connection
        );

        this.name("timestamp");
        this.suffix("Timestamped");

        super.initLabel();
      }

      copy() {
        return new TimestampOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.id(),
          this.programId(),
          this.source(),
          this.destination(),
          this.connection()
        );
      }
    }

    return TimestampOperation
  }
);