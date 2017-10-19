"use strict";
const express = require('express');
const router = express.Router();

/* GET simulator page */
router.get('/:id', function(req, res, next) {
    const title = "Reactive Robot Programming Simulator";
    const id = parseInt(req.params.id);
    res.render('simulator', {title: title, id: id});
});

module.exports = router;
