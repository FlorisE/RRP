const express = require('express');
const router = express.Router();
const ClientHandler = require("../util/ClientHandler");


/* GET home page. */
router.get('/', function (req, res, next) {
    title = "Reactive Robot Programming";
    res.render('index', {title: title});
});

module.exports = router;

