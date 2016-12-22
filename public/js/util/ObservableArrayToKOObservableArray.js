define([], function () {
    function link(module, array) {
        module.register( {
            pushed: function (list, pushed) {
                array.push(pushed);
            },
            popped: function (list, popped) {
                array.pop();
            },
            cleared: function () {
                array.removeAll();
            }
        })
    }

    return link;
});