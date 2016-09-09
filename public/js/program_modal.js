define(['knockout'], function (ko) {
    class ProgramModal {
        constructor(viewModel, connectionHandler) {
            this.name = ko.observable();
            this.viewModel = viewModel;
            this.connectionHandler = connectionHandler;
        }

        save () {
            this.connectionHandler.transmitter.addProgram(this.name());
            return true;
        }
    }

    return ProgramModal;
});