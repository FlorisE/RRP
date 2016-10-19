define([], function () {
    class NAryOperation {
        constructor(jsplumb, connectionHandler, operation) {
            this.jsplumb = jsplumb;
            this.connectionHandler = connectionHandler;
            this.operation = operation;
        }
    }

    return NAryOperation
});