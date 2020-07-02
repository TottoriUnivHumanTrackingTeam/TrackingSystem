"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.put('/log', (request, response) => {
  Handler.makeLogAndDelete(request, response)
})

router.get('/:id', (request, response) => {
  Handler.getLocationByTimeAndMap(request, response)
});

module.exports = router;
