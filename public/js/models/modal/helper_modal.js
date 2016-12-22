define(['knockout'], function (ko) {
    class HelperModal {
        constructor(viewModel, connectionHandler, helper=null) {
            if (helper == null) {
                this.id = ko.observable();
                this.name = ko.observable();
                this.body = ko.observable();
            } else {
                this.id = helper.id;
                this.name = helper.name;
                this.body = helper.body;
            }

            this.viewModel = viewModel;
            this.connectionHandler = connectionHandler;
        }

        save () {
            if (this.id() == null) {
                this.connectionHandler.transmitter.addHelper(this.name(),
                                                             this.body());
            } else {
                this.connectionHandler.transmitter.updateHelper(this.id(),
                                                                this.name(),
                                                                this.body());
            }
            $('#add-helper').modal('hide');
        }
    }

    return HelperModal;
});