"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  Handler.getMap(request, response)
});

router.post('/', (request, response) => {
  Handler.addMap(request, response)
});

router.delete('/:id', (request, response) => {
  Handler.deleteMap(request, response)
});

module.exports = router;
