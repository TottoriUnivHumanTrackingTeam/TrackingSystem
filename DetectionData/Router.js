"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.post('/', (request, response) => {
  Handler.addDetectionData(request, response)
});

router.delete('/', (request, response) => {
  Handler.deleteAllDetectionData(request, response)
})

module.exports = router;
