define(['knockout'], function (ko) {
  class HelperModal {
    constructor(viewModel, connectionHandler, helper = null) {
      if (helper == null) {
        this.id = ko.observable();
        this.name = ko.observable();
        this.body = ko.observable();
        this.parameterName = ko.observable();
      } else {
        this.id = helper.id;
        this.name = helper.name;
        this.body = helper.body;
        this.parameterName = helper.parameterName;
      }

      this.validatorModel = ko.validatedObservable(this.getValidatorModel());

      this.isValid = ko.computed(this.validatorModel.isValid);

      this.viewModel = viewModel;
      this.connectionHandler = connectionHandler;
    }

    getValidatorModel() {
      let validatorModel = {};

      validatorModel.name = this.name;
      validatorModel.parameterName = this.parameterName;
      validatorModel.body = this.body;

      return validatorModel;
    }

    save() {
      if (this.id() == null) {
        this.connectionHandler.transmitter.addHelper(this.name(),
          this.parameterName(),
          this.body());
      } else {
        this.connectionHandler.transmitter.updateHelper(this.id(),
          this.name(),
          this.parameterName(),
          this.body());
      }
      $('#add-helper').modal('hide');
    }
  }

  return HelperModal;
});