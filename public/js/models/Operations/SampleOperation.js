define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class SampleOperation extends OneToOneOperation {
      constructor(operationModule,
                  availableOperationsModule,
                  streamModule,
                  id,
                  programId,
                  source,
                  destination,
                  rate,
                  connection) {
        super(operationModule,
          availableOperationsModule,
          streamModule,
          id,
          programId,
          source,
          destination,
          false,
          connection);
        this.rate = ko.observable(rate).extend({required: true});
        this.name("sample");
        this.suffix("Sampled");

        super.initLabel();
      }

      getLabel() {
        return `${this.name()} (${this.rate()})`;
      }

      copy() {
        return new SampleOperation(
          this.operationModule,
          this.availableOperationsModule,
          this.streamModule,
          this.id(),
          this.programId(),
          this.source(),
          this.destination(),
          this.rate(),
          this.connection()
        );
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

      getCreateMessage() {
        var base = super.getCreateMessage();
        base.rate = this.rate();
        return base;
      }

      getUpdateMessage() {
        var base = super.getUpdateMessage();

        base.rate = this.rate();

        return base;
      }

      setUpdated(id, rate, source, destination) {
        this.id(id);
        this.rate(rate);
        this.source(source);
        this.destination(destination);
        return this;
      }
    }

    return SampleOperation
  }
);