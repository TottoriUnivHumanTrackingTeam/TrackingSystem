"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.get('/:id', (request, response) => {
  Handler.getLocationByTimeAndMap(request, response)
});

router.delete('/', (request, response) => {
  Handler.transferDocument(request, response)
})

module.exports = router;
