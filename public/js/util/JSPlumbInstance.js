define(['jsplumb'], function () {
    class Instance {
        constructor() {
            this.instance = jsPlumb.getInstance($('#editor-container'));
            this.instance.importDefaults({
                Connector: ["Straight"],
                Anchors:
                    [
                        "BottomCenter", "TopCenter", "Left", "Right",
                        "TopLeft", "TopRight", "BottomLeft", "BottomRight"
                    ]
            });
        }
    }

    instance = new Instance();
    return instance.instance;
});