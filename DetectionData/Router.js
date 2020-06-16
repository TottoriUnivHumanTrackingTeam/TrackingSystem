"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

router.post('/', (request, response) => {
  Handler.addDetectionData(request, response)
});
/*
router.get('/', (request, response) => {
  Handler.getDetectionData(request, response)
})
*/
module.exports = router;
