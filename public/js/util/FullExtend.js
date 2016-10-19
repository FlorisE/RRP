define([], function () {
    return function (destinationType, sourceType, overwrite=false) {
        var functions = Object.getOwnPropertyNames(
            Object.getPrototypeOf(
                sourceType
            )
        );

        // copy functions
        functions.forEach((func) => {
            if (overwrite || !destinationType[func]) {
                destinationType[func] = function() {
                    sourceType[func].apply(destinationType, arguments)
                };
            }
        });

        // copy properties
        for (var member in sourceType) {
            if (overwrite || !destinationType.hasOwnProperty(member)) {
                destinationType[member] = sourceType[member];
            }
        }

        return destinationType;
    }
});