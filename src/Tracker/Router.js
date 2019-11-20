"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  Handler.getAllTracker(request, response)
});

router.post('/', (request, response) => {
  Handler.addTracker(request, response)
});

router.get('/:id', (request, response) => {
  Handler.searchTrackerByID(request, response)
});

router.put('/:id', (request, response) => {
  Handler.updateTrackerByID(request, response)
});

router.get('/beacon/:id', (request, response) => {
  Handler.searchTrackerByBeaconID(request, response)
});

module.exports = router;
