"use strict";

const Handler = require('./PositionTrackingHandlers');
const express = require('express');
const router = express.Router();

  router.get('/start', (request, response) => {
    Handler.startPositionTracking(request, response)
  });

  router.get('/stop', (request, response) => {
   Handler.stopPositionTracking(request, response)
  });

  router.get('/log', (request, response) => {
    Handler.updateYesterdayPositionTracking(request, response)
  })

module.exports = router;
