"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  Handler.getDetector(request, response)
});

router.post('/', (request, response) => {
  Handler.addDetector(request, response)
});

router.delete('/', (request, response) => {
  Handler.deleteDetector(request, response)
});

router.put('/axis', (request, response) => {
  Handler.putDetector(request, response)
});

router.put('/active', (request, response) => {
  Handler.updateDetectorActiveLastTime(request, response)
});

module.exports = router;
