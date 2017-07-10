define([], function () {
        function link(module, array) {
            module.register( {
                cleared: (map) => array.removeAll(),
                removed: function (map, key) {
                    let item = array().find((item) => item.id() === key);
                    array.remove(item);
                },
                setted: function (map, key, value) {
                    let item = array().find((item) => item.id() === key);
                    if (item) {
                      let index = array.indexOf(item);
                      array()[index] = item;
                    } else {
                      array.push(value);
                    }
                }
            });
        }

        return link;
    }
);

