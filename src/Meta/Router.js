"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  Handler.getMeta(request, response)
});

router.post('/', (request, response) => {
  Handler.addMeta(request, response)
});

router.put('/', (request, response) => {
  Handler.putMeta(request, response)
});

router.delete('/:id', (request, response) => {
  Handler.deleteMeta(request, response)
});

module.exports = router;
