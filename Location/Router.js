"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.put('/log/oneday', (request, response) => {
  Handler.makeLogAndDelete(request, response)
})

router.put('/log/weekday', (request, response) => {
  Handler.makeLogAndDelete(request, response)
})

router.get('/:id', (request, response) => {
  Handler.getLocationByTimeAndMap(request, response)
});

module.exports = router;
