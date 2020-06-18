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

   const dt = new Date();
   const y = dt.getFullYear();
   const m = ("00" + (dt.getMonth()+1)).slice(-2);
   const d = ("00" + dt.getDate()).slice(-2);
   const dateNow = y + m + d;
   const logName = dateNow + ".json";
   const logPath = path.join('./var/log/', logName)
   let readJson;
   fs.access(logPath, fs.constants.F_OK, (err) => {
     if (err) {
       console.log(err);
       readJson = JSON.stringify([], null, ' ');
       fs.writeFile(logPath, readJson, (err) => {
         console.log(err);
       });
       return;
     }
   });
   readJson = JSON.parse(fs.readFileSync(logPath, (err) => {
     if(err){
       console.log(err);
     }
   }));
   if (detectionData !== null){
     readJson = readJson.concat(detectionData);
   }
   const jsonData = JSON.stringify(readJson, null, ' ');
   fs.writeFileSync(logPath, jsonData, (err) => {
     if (err){
       console.log(err);
     }
   });
  }
 
  static async getDetectionData(searchBeaconID, searchTimes, dateTime) {
    const logName = dateTime + ".json";
    const logPath = path.join('./var/log/', logName);
    const jsonObject = JSON.parse(fs.readFileSync(logPath, 'utf8'));
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
};
