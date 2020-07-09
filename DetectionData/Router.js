"use strict";

const Handler = require('./Handler');
const express = require('express');
const router = express.Router();

const multer = require('multer');
const diskstorage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './var/detector')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: diskstorage});

router.post('/', (request, response) => {
  Handler.addDetectionData(request, response)
});

router.post('/log', upload.single('file'), (req, res) => {
  Handler.uploadData2Server(req, res);
})

module.exports = router;
