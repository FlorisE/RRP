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
        'program',
        'program_modal',
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
              ko) {
    jsPlumb.ready(function () {

        operatorTypes = {
            "filter": ['output-stream', "lambda"],
            "map": ['output-stream', "lambda"],
            "samples": ['output-stream', "rate"],
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
            addInitial: function(initial) {
                console.log(initial);
                return true;
            }
        });

        var programModel = viewModel().program();

        var ch = new ConnectionHandler(instance, viewModel());

        viewModel().loadProgram = function(program) {
            viewModel().program(new Program(ch, instance));
            instance.reset();
            ch.transmitter.loadProgram(program.id);
        };

        viewModel().addProgramModal = function () {
            viewModel().programModal(new ProgramModal(viewModel(), ch))
        };

        ko.applyBindings(viewModel);

        ch.connect();
    });
});