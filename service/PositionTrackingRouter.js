"use strict";

const Handler = require('./PositionTrackingHandlers');
const express = require('express');
const router = express.Router();

  router.post('/start', (request, response) => {
    Handler.startPositionTracking(request, response)
  });

  router.get('/stop', (request, response) => {
   Handler.stopPositionTracking(request, response)
  });

module.exports = router;
