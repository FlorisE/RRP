define(['knockout'], function (ko) {
    var self = this;
    self.ko = ko;
    return (operation, jsplumb) => {
        var source = $("#stream" + operation.source());
        var destination = $("#stream" + operation.destination());

        if (source.length + destination.length === 2) {
            jsplumb.connect({
                source: "stream" + operation.source(),
                target: jsplumb.addEndpoint(
                    "stream" + operation.destination(),
                    {
                        endpoint: "Blank",
                        anchor: "TopCenter"
                    }),
                overlays: [
                    [
                        "Custom",
                        {
                            create: (component) => $("#operator" + operation.id())
                        }
                    ]
                ]
            });
            operation.connected(true);
        }
    }
});