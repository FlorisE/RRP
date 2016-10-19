define([], function () {
        function link(module, array) {
            module.register( {
                cleared: (map) => array.removeAll(),
                deleted: function (map, key) {
                    var item = array().find((item) => item.id() == key);
                    array.remove(item);
                },
                setted: function (map, key, value) {
                    var item = array().find((item) => item.id() == key);
                    if (item == null) {
                        array.push(value);
                    } else {
                        var index = array.indexOf(item);
                        array()[index] = item;
                    }
                }
            });
        }

        return link;
    }
);

