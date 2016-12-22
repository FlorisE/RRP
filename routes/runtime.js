"use strict";
const express = require('express');
const router = express.Router();

class Runtime {

    constructor(router) {
        this.router = router;

        this.router.get('/', this.handleGet.bind(this));
    }

    handleGet(req, res, next) {
        res.io.on('connection', function (socket) {
            console.log("client connected");
        });
        return res.send(req.id);
    }

}

let runtime = new Runtime(router);

module.exports = runtime.router;
