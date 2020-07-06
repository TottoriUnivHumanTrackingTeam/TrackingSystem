'use strict';

const _ = require('underscore');
const fs = require('fs');
const TrackerRepository = require('../Tracker/TrackerRepository');
const DetectorRepository = require('../Detector/DetectorRepository');
const DetectionDataRepository = require('../DetectionData/DetectionDataRepository');
const LocationRepository = require('../Location/LocationRepository');
const MapRepository = require('../Map/MapRepository');
const devkit = require('../devkit');

const weightOfMedian = 2;
const weightOfDistance = 1.8;

module.exports = class PositionTracking {
  static async updateLocations(calcTime, byJson=false) {
    const allTrackers = await TrackerRepository.getAllTracker();
    const calcTimeQuery = {
      start: calcTime - 3000, //MAMORIOは6000 3秒前でデータ取得
      end: calcTime
    };
    for (let tracker of allTrackers) {
      let detectionDatas = undefined;
      if (byJson) {
        detectionDatas = await DetectionDataRepository.getDetectionDataByJson(
          tracker.beaconID,
          calcTimeQuery,
          devkit.getDate2ymd()
        );
      } else {
        detectionDatas = await DetectionDataRepository.getDetectionData(
          tracker.beaconID,
          calcTimeQuery
        );
      }
      //console.log(detectionDatas.length); 受信データ数の表示
      if (detectionDatas.length) {
        const dataGroupByDetectorNum = _.groupBy(detectionDatas, 'detectorNumber'); //受信機の番号分け
        let fixedDetectionDatas = [];
        for (let detectorNum in dataGroupByDetectorNum) {
          const sortedDetectorData = _.sortBy(dataGroupByDetectorNum[detectorNum], 'RSSI'); //受信機の番号ごとのRSSIソート
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
            numOfDataForAve: sortedDetectorData.length
          }; //受信機ごとの平均RSSIと受信件数を示すデータ

          fixedDetectionDatas.push(fixedDetectionData);
        }
        const beaconAxis = await this.positionCalc(tracker.beaconID, fixedDetectionDatas);
        LocationRepository.addLocation(beaconAxis);
      }
    }
  }

  static async renewLocation() {
    const allTrackers = await TrackerRepository.getAllTracker();
    const allDetectionDatas = await DetectionDataRepository.detectorLog2Json();
    const sortedAllDetectionDataByDetectedTime = _.sortBy(allDetectionDatas, 'detectedTime');
    let startTime = Number(sortedAllDetectionDataByDetectedTime[0].detectedTime);
    startTime = Math.floor(startTime/1000) * 1000;
    const endTime = startTime + 86400000;
    for (let tracker of allTrackers) {
      while (endTime >= startTime) {
        const calcTimeQuery = {
          start: startTime,
          end: startTime + 1000
        };
        startTime += 1000;
        const detectionDatas = devkit.getBetweenTime(calcTimeQuery, sortedAllDetectionDataByDetectedTime);
        if (detectionDatas.length === 0) {
          continue;
        }
        const dataGroupByDetectorNum = _.groupBy(detectionDatas, 'detectorNumber');
        let fixedDetectionDatas = [];
        for (let detectorNum in dataGroupByDetectorNum) {
          const sortedDetectorData = _.sortBy(dataGroupByDetectorNum[detectorNum], 'RSSI');
          let aveRSSI = 0;
          for (let detectionData of sortedDetectorData) {
            aveRSSI += detectionData.RSSI;
          }
          aveRSSI /= sortedDetectorData.length;
          let fixedDetectionData = {
            detectorNumber: detectorNum,
            RSSI: aveRSSI,
            TxPower: dataGroupByDetectorNum[detectorNum][0].TxPower,
            numOfDataForAve: sortedDetectorData.length,
            detectedTime: startTime
          };
          fixedDetectionDatas.push(fixedDetectionData);
        }
        const beaconAxis = await this.positionCalc(tracker.beaconID, fixedDetectionDatas);
        LocationRepository.addLocation(beaconAxis, "updateLocation");
      }
    }
  }

  static async positionCalc(beaconID, detectionDatas) {
    const date = new Date();
    const time = detectionDatas[0].detectedTime; //過去のデータを参照したか
    let beaconAxis = {
      beaconID: beaconID,
      grid: { x: 0, y: 0 },
      weight: 0,
      map: '',
      time: (time ? time : date.getTime())
    };

    for (let detectionData of detectionDatas) {
      const detector = await DetectorRepository.getDetector(Number(detectionData.detectorNumber));
      const weightForCalc = detectionData.numOfDataForAve / detectionDatas.length; //受信機ごとの受信件数を受信機数で割る
      detectionData.distance =
        10 ** ((detectionData.TxPower - detectionData.RSSI) / (10 * weightOfDistance)); //フリスの伝達
      beaconAxis.grid.x += (detector.detectorGrid.x / detectionData.distance) * weightForCalc; //受信機設置場所から距離を割って重み付与
      beaconAxis.grid.y += (detector.detectorGrid.y / detectionData.distance) * weightForCalc;
      beaconAxis.weight += (1 / detectionData.distance) * weightForCalc; //座標の重みづけ（フィンガープリンティング？）
      /* 受信機ごとの情報取得
      console.log("THIS IS DISTANCE")
      console.log(detectionData);
      console.log(detectionData.distance); 
      */
      //console.log(beaconAxis);
    }

    beaconAxis.grid.x = parseInt(beaconAxis.grid.x / beaconAxis.weight);
    beaconAxis.grid.y = parseInt(beaconAxis.grid.y / beaconAxis.weight);

    const lastLocation = await LocationRepository.getLocationByTime(beaconAxis.beaconID, { //時間が飛んだ時の取得を防ぐ
      start: beaconAxis.time - 1200,
      end: beaconAxis.time
    }, time ? "updateLocation" : "location"); //過去の結果を参照するか
    if (lastLocation[0]) {
      beaconAxis.grid.x = parseInt((lastLocation[0].grid.x * 1.6 + beaconAxis.grid.x * 0.4) / 2); //1.6と0.4は任意で位置に重み
      beaconAxis.grid.y = parseInt((lastLocation[0].grid.y * 1.6 + beaconAxis.grid.y * 0.4) / 2); 
    }
    const sortedDetectorDataByDistance = _.sortBy(detectionDatas, 'distance');
    const nearestDetector = await DetectorRepository.getDetector(
      Number(sortedDetectorDataByDistance[0].detectorNumber)
    );
    beaconAxis.map = await this.estimationMap(beaconAxis.grid); //受信機位置のmapに埋め込む
    if (!beaconAxis.map) beaconAxis.map = nearestDetector.detectorMap;
    delete beaconAxis.weight;
    /* 位置推定結果
    console.log("THIS IS DETECTED");
    console.log(beaconAxis);
    */

    return beaconAxis;
  }

  static async estimationMap(grid) {
    const isContain = map => {
      const m = _.find(map.size, function(size) {
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
