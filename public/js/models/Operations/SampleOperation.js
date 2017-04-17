define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class SampleOperation extends OneToOneOperation {
      constructor(operationModule,
                  availableOperationsModule,
                  streamModule,
                  id,
                  programId,
                  source,
                  destination,
                  rate) {
        super(operationModule,
          availableOperationsModule,
          streamModule,
          id,
          programId,
          source,
          destination,
          false);
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
          this.rate()
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

      update(operation) {
        this.id(operation.id);
        this.rate(operation.rate);
        this.source(operation.source);
        this.destination(operation.destination);
        return this;
      }
    }

    return SampleOperation
  }
);