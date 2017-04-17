"use strict";
const uuid = require("node-uuid");
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver("bolt://localhost",
                          neo4j.auth.basic("neo4j", "rrp"));
const Sender = require('../util/sender');
const ModuleFactory = require('../util/ModuleFactory');

let modules = new Map([
    ["program", 'Program'],
    ["stream", 'Stream'],
    ["sensorStream", "SensorStream"],
    ["actuatorStream", "ActuatorStream"],
    ["helper", 'Helper'],
    ["operation", 'Operation']
]);

class ClientHandler {

    constructor() {
        this.clients = [];
    }

    connect(socket) {
        this.id = uuid.v4();
        this.socket = socket;
        console.log(`client connected`);
        socket.emit("id", this.id);
        socket.on(this.id, this.message.bind(this));
        socket.on('error', function(error) {
            console.log(error);
        });
        socket.on('disconnect', function() {
            console.log("Client disconnected");
        });
    }

    message(msg, callback) {
        this.logTime(`Received ${msg.action} on ${msg.type}`);

        var session = driver.session();

        try {
            var dispatcher = this.getDispatcher(session, msg.type, msg.action);
            dispatcher(msg, callback);
        } catch (err) {
            console.log(err);
        }

        //session.close();
    }


    logTime(msg=null) {
        const date = new Date();
        const h = date.getHours();
        const m = date.getMinutes();
        const ms = date.getMilliseconds();
        const dateTime = h + ":" + m + ":" + ms;
        if (msg == null) {
            console.log(dateTime);
        } else {
            console.log(dateTime + ": " + msg);
        }
    }

    getDispatcher(session, type, action) {
        let sender = new Sender(this.id, this.socket);
        let moduleFactory = new ModuleFactory(session, sender);
        let module = moduleFactory.getModule(modules.get(type));

        if (!module) {
            throw `Module ${type} not found`;
        }

        var executor = module[action];

        if (!executor) {
            throw `Executor ${action} on module ${type} not found`;
        }

        return executor.bind(module);
    }
}

module.exports = new ClientHandler();

