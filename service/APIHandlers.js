'use strict';

const PositionTracking = require('./PositionTracking');
const DetectionDataRepository = require('../DetectionData/DetectionDataRepository');
const TrackerRepository = require('../Tracker/TrackerRepository');
const DetectorRepository = require('../Detector/DetectorRepository');
const MapRepository = require('../Map/MapRepository');
const Alart = require('../Alart/Alart');

let timerID = 0;
let dataAddID = 0;
const detectionDataBuffer = [];

module.exports = class APIHandlers {
    static addDetectionData(req, res) {
        const detectionData = req.body;
        detectionDataBuffer.push(detectionData);
        res.send("DetectionData Add Success!");
        if(!dataAddID) {
            dataAddID = setInterval(() => {
                DetectionDataRepository.addDetectionData(detectionDataBuffer)
                    .then( () => detectionDataBuffer.length = 0 );
            }, 3000);
        }
    }

    static addTracker(req, res) {
        const tracker = req.body;
        TrackerRepository.addTracker(tracker)
            .then(() => {
                res.send("Tracker Add Success!");
            });
    }

    static addDetector(req, res) {
        const detector = req.body;
        DetectorRepository.addDetector(detector)
            .then(() => {
                res.send("Detector Add Success!");
            });
    }


    static updateDetectorActiveLastTime(req, res) {
        const detector = req.body;
        DetectorRepository.updateDetectorActiveLastTime(detector)
            .then(() => {
                res.send("Detector Active Time Updated!");
            });
    }

    static addMap(req, res) {
        const map = req.body;
        MapRepository.addMap(map)
            .then(() => {
                res.send("Map Add Success!");
            });
    }

    static async getAllTracker(req, res) {
        const trackers = await TrackerRepository.getAllTracker();
        res.json(trackers);
    }

    static searchTrackerByID(req, res) {
        const trackerID = req.params.id;
        const times = req.body;
        TrackerRepository.getTrackerByTrackerID(trackerID, times)
            .then((response) => {
                res.json(response);
            });
    }

    static updateTrackerByID(req, res) {
        const trackerID = req.params.id;
        const newValueQuery = req.body;
        TrackerRepository.updateTracker(trackerID, newValueQuery)
            .then(() => {
                res.send("Tracker Update Success!");
            });
    }

    static addTracker(req, res) {
        const tracker = req.body;
        TrackerRepository.addTracker(tracker)
            .then(() => {
                res.send("Tracker Add Success!");
            });
    }

    static addTrackerMailAddr(req, res) {
        const trackerID = req.params.id;
        const addr = req.body;
        TrackerRepository.addTrackerMailAddr(trackerID, addr)
            .then(() => {
                res.send("TrackerAddr Update Success!");
            });
    }

    static startPositionTracking(req, res) {
        timerID = setInterval(() => {
            const date = new Date();
            const startTime = date.getTime()-5000;
            PositionTracking.updateLocations(startTime);
            Alart.check();
        }, 1000);
        res.send("Tracking Start!");
    }

    static stopPositionTracking(req, res) {
        clearInterval(timerID);
        res.send("Tracking Stop!");
    }

    static getDetector(req, res) {
        DetectorRepository.getDetector()
            .then((detector) => {
                res.send(detector);
            });
    }

    static deleteDetector(req, res) {
        const detectorId = req.body.detectorNumber;
        DetectorRepository.removeDetector(detectorId)
            .then(() => {
                res.send('Successfully delete detector!');
            });
    }

    static putDetector(req, res) {
        const detector = req.body;
        DetectorRepository.updateDetector(detector)
            .then(() => {
                res.send('Successfully put detector!');
            });
    }

    static getMap(req, res) {
        MapRepository.getMap()
            .then((map) => {
                res.send(map);
            });
    }
};