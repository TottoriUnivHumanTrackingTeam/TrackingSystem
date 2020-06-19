"use strict";

//detecterからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const _ = require("underscore");
const MongoClient = require("mongodb").MongoClient;
const DetectionData = require("./DetectionData");

const fs = require("fs");
const path = require("path");

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

    const dt = new Date();
    const y = dt.getFullYear();
    const m = ("00" + (dt.getMonth()+1)).slice(-2);
    const d = ("00" + dt.getDate()).slice(-2);
    const dateNow = y + m + d;
    const logName = dateNow + ".json";
    const logPath = path.join('./var/log/', logName)
    fs.stat(logPath, (err, stats) => {
      if (err) {
        fs.writeFile(logPath, "", (err) => {
          console.log(err);
        });
      }
    });
    if (detectionData !== null){
      fs.appendFileSync(logPath, JSON.stringify(detectionData));
    }
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
  //JsonからDetectionDataを取得する
  static async getDetectionDataByJson(searchBeaconID, searchTimes, dateTime) {
    const logName = dateTime + ".json";
    const logPath = path.join('./var/log/', logName);
    const jsonLog = fs.readFileSync(logPath, 'utf8');
    const regex = /\]\[/g;
    const jsonObject = JSON.parse(jsonLog.replace(regex, ","))
    //searchQueryがないとPositionCalcが死ぬ？
    const filterJson = jsonObject.filter((detectionData) => {
      const startBoolean = (Number(detectionData.detectedTime) >= Number(searchTimes.start));
      const endBoolean = (Number(detectionData.detectedTime) <= Number(searchTimes.end));
      if (startBoolean && endBoolean)
        if(detectionData.beaconID === searchBeaconID)
          return true;
    })
    let detectionDatas = [];
    for (let detectionData of filterJson) {
      detectionDatas.push(detectionData);
    }
    return detectionDatas;
  }
  //detectionDataをDBから全件削除
  static async deleteAllDetectionData(){
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db
      .collection("detectionData")
      .deleteMany({});
    client.close();
    return res.result;
  }
};
