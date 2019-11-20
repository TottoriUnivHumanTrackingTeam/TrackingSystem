"use strict";

const DetectorRepository = require("./DetectorRepository");

module.exports = class Handler {
  static addDetector(req, res) {
    const detector = req.body;
    DetectorRepository.addDetector(detector).then(() => {
      res.send("Detector Add Success!");
    });
  }

  static getDetector(req, res) {
    DetectorRepository.getDetector().then(detector => {
      res.send(detector);
    });
  }

  static deleteDetector(req, res) {
    const detectorId = req.body.detectorNumber;
    DetectorRepository.removeDetector(detectorId).then(() => {
      res.send("Successfully delete detector!");
    });
  }

  static putDetector(req, res) {
    const detector = req.body;
    DetectorRepository.updateDetector(detector).then(() => {
      res.send("Successfully put detector!");
    });
  }

  static updateDetectorActiveLastTime(req, res) {
    const detector = req.body;
    DetectorRepository.updateDetectorActiveLastTime(detector).then(() => {
      res.send("Detector Active Time Updated!");
    });
  }
};
