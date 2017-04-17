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
    jsplumb: "lib/jsplumb",
    wu: "lib/wu",
    ace: "lib/ace",
    "jqueryui": 'lib/jqueryui'
  }
});

define([
    'jquery',
    'bootstrap',
    'util/ConnectionHandler',
    'modules/DependencyInjector',
    'knockout',
    // some implicit dependencies
    "knockout.validation",
    "jqueryui"
  ],
  function (jQuery,
            bootstrap,
            ConnectionHandler,
            DependencyInjector,
            ko) {

    jsPlumb.ready(function () {

      /*operationTypes = {
       "filter": ['output-stream', "lambda"],
       "map": ['output-stream', "lambda"],
       "sample": ['output-stream', "rate"],
       "timestamp": ['output-stream'],
       "subscribe": ["output-module"]
       };*/

      var instance = jsPlumb.getInstance($('#editor-container'));
      instance.importDefaults({
        Connector: ["Straight"],
        Anchors: [
          "BottomCenter", "TopCenter", "Left", "Right",
          "TopLeft", "TopRight", "BottomLeft", "BottomRight"
        ]
      });

      var connectionHandler = new ConnectionHandler();
      var dependencyInjector = new DependencyInjector(connectionHandler);
      var editor = dependencyInjector.editorModule.getEditor();

      connectionHandler.connect(
        function () {
          console.log("Connection established");
        },
        dependencyInjector
      );

      ko.applyBindings(editor);

      $(".modal").draggable({
          handle: ".modal-header"
      });
    });
  });
