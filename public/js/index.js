require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        'socket.io': {
            exports: 'io'
        },
        "bootstrap": {
            "deps": ['jquery']
        },
        "jsbplumb": {
            exports: 'jsPlumb'
        },
        "knockout": {
            exports: ['ko', 'knockout']
        },
        "knockout.validation": {
            "deps": ['knockout']
        }
    },
    paths: {
        'socket.io': 'lib/socket.io',
        knockout: 'lib/knockout',
        bootstrap: 'lib/bootstrap',
        jquery: 'lib/jquery',
        "knockout.validation": "lib/knockout.validation",
        jsplumb: "lib/jsplumb"
    }
});

define([
        'jquery',
        'bootstrap',
        'connectionhandler',
        'models/program',
        'models/modal/program_modal',
        'models/modal/helper_modal',
        'knockout',
        'knockout.validation',
        'jsplumb'
    ],
    function (
              jQuery,
              bootstrap,
              ConnectionHandler,
              Program,
              ProgramModal,
              HelperModal,
              ko) {
    jsPlumb.ready(function () {

        operatorTypes = {
            "filter": ['output-stream', "lambda"],
            "map": ['output-stream', "lambda"],
            "sample": ['output-stream', "rate"],
            "timestamp": ['output-stream'],
            "subscribe": ["output-module"]
        };

        var instance = jsPlumb.getInstance($('#editor-container'));
        instance.importDefaults({
            Connector: ["Straight"],
            Anchors:
                [
                    "BottomCenter", "TopCenter", "Left", "Right",
                    "TopLeft", "TopRight", "BottomLeft", "BottomRight"
                ]
        });

        id = $('#id').html();

        viewModel = ko.validatedObservable({
            programs: ko.observableArray(),
            program: ko.observable(),
            programModal: ko.observable(),
            helperModal: ko.observable(),
            addInitial: function(initial) {
                console.log(initial);
                return true;
            }
        });

        var programModel = viewModel().program();

        var ch = new ConnectionHandler(instance, viewModel());

        viewModel().loadProgram = function(program) {
            viewModel().program(new Program(ch, instance, program.id));
            instance.reset();
            ch.transmitter.loadProgram(program.id);
            return true;
        };

        viewModel().addProgramModal = function () {
            viewModel().programModal(new ProgramModal(viewModel(), ch));
            return true;
        };

        viewModel().addHelper = function () {
            viewModel().helperModal(new HelperModal(viewModel(), ch));
            return true;
        };

        viewModel().editHelper = function() {
            viewModel().helperModal(new HelperModal(viewModel(), ch, this));
            return true;
        };

        ko.applyBindings(viewModel);

        ch.connect();
    });
});