define(['knockout', './OneToOneOperation'], function (ko, OneToOneOperation) {

    class ForgetAfterOperation extends OneToOneOperation {
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
          null,
          null,
          null,
          null,
          connection);
        this.rate = ko.observable(rate).extend({required: true});
        this.name("forgetAfter");
        this.suffix("Temp");

        super.initLabel();
      }

      getLabel() {
        return `${this.name()} (${this.rate()})`;
      }

      copy() {
        return new ForgetAfterOperation(
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

      getValidatorModel() {
        let validatorModel = super.getValidatorModel();

        validatorModel.rate = this.rate;

        return validatorModel;
      }
    }

    return ForgetAfterOperation
  }
);