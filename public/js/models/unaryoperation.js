define(['knockout'], function (ko) {
  var self = this;
  self.ko = ko;
  return (operation, jsplumb) => {
    var source = $("#stream" + operation.source());
    var destination = $("#stream" + operation.destination());

    if (source.length + destination.length === 2) {
      let connection = jsplumb.connect({
        source: jsplumb.addEndpoint(
          "stream" + operation.source(),
          {
            endpoint: "Blank",
            anchor: "BottomCenter" // another nice option is Continuous
          }),
        target: jsplumb.addEndpoint(
          "stream" + operation.destination(),
          {
            endpoint: "Blank",
            anchor: "TopCenter", // another nice option is Continuous
          }),
        overlays: [
          [
            "Custom",
            {
              create: (component) => $("#operation" + operation.id())
            }
          ]
        ],
        connectorOverlays:[
          [ "Arrow", { width:10, length:30, location:1, id:"arrow" } ]
        ]
      });
      operation.connection(connection);
    }
  }
});