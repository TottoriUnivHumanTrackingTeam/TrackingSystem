"use strict";

//detecterからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const _ = require("underscore");
const MongoClient = require("mongodb").MongoClient;
const DetectionData = require("./DetectionData");

const devkit = require('../devkit');
const path = require('path');
const fs = require('fs');

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class DetectionDataRepository {
  static async addDetectionData(putDetectionData) {
    const detectionData = [];
    _.each(putDetectionData, data => {
      detectionData.push(
        new DetectionData(
          Number(data["detectorNumber"]),
          Number(data["rssi"]),
          Number(data["measuredPower"]),
          data["beaconID"],
          data["detectedTime"]
        )
      );
    });

    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection("detectionData").insertMany(detectionData);
    client.close();
    this.writeDetectionData(detectionData);
    return res.result;
  }

  static async writeDetectionData(detectionData) {
    const dateNow = devkit.getDate2ymd();
    const logName = dateNow + ".json";
    const loggerPath = path.join('./var/log/', logName);
    if (!devkit.isExistFile(loggerPath)) {
      fs.writeFile(loggerPath, "", (err) => {
        console.log(err);
      })
    }
    if (detectionData !== null) {
      fs.appendFileSync(loggerPath, JSON.stringify(detectionData));
    }
  }

  static async getDetectionData(searchBeaconID, searchTimes) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = {
      $and: [
        {
          detectedTime: { $lte: searchTimes["end"], $gte: searchTimes["start"] }
        },
        { beaconID: searchBeaconID }
      ]
    };
    const detectionDataQuery = await db
      .collection("detectionData")
      .find(searchQuery)
      .toArray();
    client.close();
    let detectionDatas = [];
    for (let detectionData of detectionDataQuery) {
      detectionDatas.push(detectionData);
    }
    return detectionDatas;
  }

  static async getDetectionDataByJson(searchBeaconID, searchTimes, dateTime) {
    const logName = dateTime + ".json";
    const logPath = path.join('./var/log/', logName);
    const jsonLog = fs.readFileSync(logPath, 'utf-8');
    const regex = /\]\[/g; //appendFileSyncでログデータに"]["が存在するため
    const jsonObject = JSON.parse(jsonLog.replace(regex, ","));
    const filterJson = devkit.getBetweenTime(searchTimes, jsonObject, searchBeaconID);
    let detectionDatas = [];
    for (let detectionData of filterJson) {
      detectionDatas.push(detectionData);
    }
    return detectionDatas
  }

  static async deleteDetectionData() {
    const client = await MongoClient.connect(DBURL).catch((err) => {
      console.log(err);
    })
    const db = client.detectedTime(DBName);
    const res = await db
      .collection("detectionData")
      .deleteMany({});
    client.close();
    const dateTime = devkit.getDate2ymd(undefined, true);
    const logName = dateTime + ".json"
    const logPath = path.join('/var/log/', logName);
    fs.unlinkSync(logPath)
    return res.result;
  }

  static async detectorLog2Json() {
    return new Promise((resolve, reject) => {
      let log2json = [];
      let tasks = [];
      for (let detectorNumber = 1; detectorNumber <= 25; detectorNumber++) {
        tasks.push(devkit.readCsvFileData(detectorNumber).then(result => {
          console.log(`DetectorNo${detectorNumber} read ok`);
          log2json = log2json.concat(result);
        }))
      }
      Promise.allSettled(tasks).then(result => {
        resolve(log2json);
      })
    })
  }
};
