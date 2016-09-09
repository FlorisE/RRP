define(['knockout'], function (ko) {
    var self = this;
    self.ko = ko;
    return (operation, jsplumb) => {
        jsplumb.connect({
            source: "stream" + operation.source.id,
            target: jsplumb.addEndpoint(
                "stream" + operation.destination.id,
                {
                    endpoint: "Blank",
                    anchor: "TopCenter"
                }),
            overlays: [
                [
                    "Custom",
                    {
                        create: (component) => $("#operator" + operation.id)
                    }
                ]
            ]
        });

    }
});