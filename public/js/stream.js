define(['dragger'], function (Dragger) {
    function stream(jsplumb, connectionHandler, stream) {
        var dragger = null;
        var m = new Mottle({ smartClicks:true });

        m.on("#stream" + stream.id, "tap", function(e) {
            stream.menuVisible(!stream.menuVisible());
        });

        jsplumb.draggable(
            $("#stream" + stream.id),
            {
                start: function (params) {
                    t = connectionHandler.transmitter;
                    dragger = new Dragger(
                        stream.x,
                        stream.y,
                        t.updateStream.bind(t),
                        params.el
                    );
                },
                drag: function (params) {
                    dragger.dragMove(params.pos[0], params.pos[1]);
                },
                stop: function (params) {
                    dragger.dragStop(params.pos[0], params.pos[1]);
                }
            }
        );
    }

    return stream;
});