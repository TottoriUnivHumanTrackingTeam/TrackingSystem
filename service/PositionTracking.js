'use strict';

const _ = require('underscore');
const fs = require('fs');
const TrackerRepository = require('../Tracker/TrackerRepository');
const DetectorRepository = require('../Detector/DetectorRepository');
const DetectionDataRepository = require('../DetectionData/DetectionDataRepository');
const LocationRepository = require('../Location/LocationRepository');
const MapRepository = require('../Map/MapRepository');

const weightOfMedian = 2;
const weightOfDistance = 1.8;

module.exports = class PositionTracking {
  static async updateLocations(calcTime) {
    const allTrackers = await TrackerRepository.getAllTracker();
    const calcTimeQuery = {
      start: calcTime - 3000, //MAMORIOは6000
      end: calcTime,
    };
    for (let tracker of allTrackers) {
      const detectionDatas = await DetectionDataRepository.getDetectionData(
        tracker.beaconID,
        calcTimeQuery
      );
      //console.log(detectionDatas);
      if (detectionDatas.length) {
        const dataGroupByDetectorNum = _.groupBy(detectionDatas, 'detectorNumber');

        let fixedDetectionDatas = [];
        for (let detectorNum in dataGroupByDetectorNum) {
          const sortedDetectorData = _.sortBy(dataGroupByDetectorNum[detectorNum], 'RSSI');
          //const median = sortedDetectorData[sortedDetectorData.length/2].RSSI;

          let aveRSSI = 0;
          for (let detectorData of sortedDetectorData) {
            aveRSSI += detectorData.RSSI;
          }

          aveRSSI = aveRSSI / sortedDetectorData.length;

          let fixedDetectionData = {
            detectorNumber: detectorNum,
            RSSI: aveRSSI,
            TxPower: dataGroupByDetectorNum[detectorNum][0].TxPower,
            numOfDataForAve: sortedDetectorData.length,
          };

          fixedDetectionDatas.push(fixedDetectionData);
        }
        const beaconAxis = await this.positionCalc(tracker.beaconID, fixedDetectionDatas);
        LocationRepository.addLocation(beaconAxis);
      }
    }
  }

  static async positionCalc(beaconID, detectionDatas) {
    const date = new Date();
    let beaconAxis = {
      beaconID: beaconID,
      grid: { x: 0, y: 0 },
      weight: 0,
      map: '',
      time: date.getTime(),
    };

    for (let detectionData of detectionDatas) {
      const detector = await DetectorRepository.getDetector(Number(detectionData.detectorNumber));
      const weightForCalc = detectionData.numOfDataForAve / detectionDatas.length;
      detectionData.distance =
        10 ** ((detectionData.TxPower - detectionData.RSSI) / (10 * weightOfDistance));

      beaconAxis.grid.x += (detector.detectorGrid.x / detectionData.distance) * weightForCalc;
      beaconAxis.grid.y += (detector.detectorGrid.y / detectionData.distance) * weightForCalc;
      beaconAxis.weight += (1 / detectionData.distance) * weightForCalc;
    }

    beaconAxis.grid.x = parseInt(beaconAxis.grid.x / beaconAxis.weight);
    beaconAxis.grid.y = parseInt(beaconAxis.grid.y / beaconAxis.weight);

    const lastLocation = await LocationRepository.getLocationByTime(beaconAxis.beaconID, {
      start: beaconAxis.time - 1200,
      end: beaconAxis.time,
    });
    if (lastLocation[0]) {
      beaconAxis.grid.x = parseInt((lastLocation[0].grid.x * 1.6 + beaconAxis.grid.x * 0.4) / 2);
      beaconAxis.grid.y = parseInt((lastLocation[0].grid.y * 1.6 + beaconAxis.grid.y * 0.4) / 2);
    }
    const sortedDetectorDataByDistance = _.sortBy(detectionDatas, 'distance');
    const nearestDetector = await DetectorRepository.getDetector(
      Number(sortedDetectorDataByDistance[0].detectorNumber)
    );
    beaconAxis.map = await this.estimationMap(beaconAxis.grid);
    if (!beaconAxis.map) beaconAxis.map = nearestDetector.detectorMap;
    delete beaconAxis.weight;

    return beaconAxis;
  }

  static async estimationMap(grid) {
    const isContain = (map) => {
      const m = _.find(map.size, function (size) {
        return (
          grid.x > size.min.x && grid.x < size.max.x && grid.y > size.min.y && grid.y < size.max.y
        );
      });
      if (m) {
        return true;
      } else {
        return false;
      }
    };
    const allMaps = await MapRepository.getAllMap();
    for (let map of allMaps) {
      if (isContain(map)) {
        return map.mapID;
      }
    }
  }
};
