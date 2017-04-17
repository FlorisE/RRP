"use strict";
const express = require('express');
const router = express.Router();
const RuntimeModule = require('../modules/RuntimeModule');
const runtimeModule = new RuntimeModule(null, null, null, null, "nao");

class Runtime {

    constructor(router) {
        this.router = router;

        this.router.get('/:id', this.getSingle.bind(this));
        this.router.get('/', this.getMultiple.bind(this));
        this.router.post('/:id', this.start.bind(this));
        this.router.put('/:id', this.restart.bind(this));
        this.router.delete('/:id', this.stop.bind(this));
    }

    // returns list of running processes
    getMultiple(req, res, next) {
        res.send(runtimeModule.running());
    }

    // returns information about running process
    getSingle(req, res, next) {
        const id = parseInt(req.params.id);
        res.send(runtimeModule.info(id));
    }

    // starts a process
    start(req, res, next) {
        const id = parseInt(req.params.id);
        const response = runtimeModule.start(id);
        res.send(response);
    }

    // restarts a process
    restart(req, res, next) {
        const id = parseInt(req.params.id);
        const response = runtimeModule.restart(id);
        res.send(response);
    }

    // stops a process
    stop(req, res, next) {
        const id = parseInt(req.params.id);
        const response = runtimeModule.stop(id);
        res.send(response);
    }

}

let runtime = new Runtime(router);

module.exports = runtime.router;
