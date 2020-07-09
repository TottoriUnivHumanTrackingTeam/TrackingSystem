"use strict";

const DetectionDataRepository = require("../DetectionData/DetectionDataRepository");

module.exports = class Handler {
  static addDetectionData(req, res) {
    const detectionData = req.body;
    DetectionDataRepository.addDetectionData(detectionData).then(() => {
      res.send("DetectionData Add Success!");
    });
  }

  static uploadData2Server(req, res) {
    DetectionDataRepository.uploadData2Server(req.file).then(() => {
      res.send("Upload Success!");
    })
  }
};
