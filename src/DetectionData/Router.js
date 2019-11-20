"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.post('/', (request, response) => {
  Handler.addDetectionData(request, response)
});

module.exports = router;
