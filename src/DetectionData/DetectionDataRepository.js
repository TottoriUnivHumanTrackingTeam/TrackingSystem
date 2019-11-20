"use strict";

//detecterからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const _ = require("underscore");
const MongoClient = require("mongodb").MongoClient;
const DetectionData = require("./DetectionData");

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
    return res.result;
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
};
