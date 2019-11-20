"use strict";

const TrackerRepository = require("./TrackerRepository");

module.exports = class Handler {
  static addTracker(req, res) {
    const tracker = req.body;
    TrackerRepository.addTracker(tracker).then(() => {
      res.send("Tracker Add Success!");
    });
  }

  static async getAllTracker(req, res) {
    let searchTime = {};
    if (req.query.start && req.query.end) {
      searchTime = {
        start: Number(req.query.start),
        end: Number(req.query.end)
      };
    }
    const trackers = await TrackerRepository.getAllTracker(searchTime);
    res.json(trackers);
  }

  static searchTrackerByID(req, res) {
    const trackerID = req.params.id;
    const needMapName = req.query.needMapName;
    let times = {};
    if (req.query.start && req.query.end) {
      times = {
        start: Number(req.query.start),
        end: Number(req.query.end)
      };
    }
    TrackerRepository.getTrackerByTrackerID(trackerID, times, needMapName).then(
      response => {
        res.json(response);
      }
    );
  }

  static searchTrackerByBeaconID(req, res) {
    const beaconID = req.params.id;
    const needMapName = req.query.needMapName;
    let times = {};
    if (req.query.start && req.query.end) {
      times = {
        start: Number(req.query.start),
        end: Number(req.query.end)
      };
    }
    TrackerRepository.getTrackerByBeaconID(beaconID, times, needMapName).then(
      response => {
        res.json(response);
      }
    );
  }

  static updateTrackerByID(req, res) {
    const trackerID = req.params.id;
    const newValueQuery = req.body;
    TrackerRepository.updateTracker(trackerID, newValueQuery).then(() => {
      res.send("Tracker Update Success!");
    });
  }
};
