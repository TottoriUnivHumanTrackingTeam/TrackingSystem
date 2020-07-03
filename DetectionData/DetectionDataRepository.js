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
    const logPath = path.join('./var/log/', logName);
    if (!devkit.isExistFile(logPath)) {
      fs.writeFile(logPath, "", (err) => {
        console.log(err);
      });
    };
    if (detectionData !== null) {
      fs.appendFileSync(logPath, JSON.stringify(detectionData));
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
    const detectionDatas = [];
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
    return res.result;
  }
};
