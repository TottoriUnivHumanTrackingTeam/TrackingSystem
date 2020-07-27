"use strict";

//detecterからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const _ = require("underscore");
const MongoClient = require("mongodb").MongoClient;
const DetectionData = require("./DetectionData");

const devkit = require('../devkit');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { result } = require('underscore');

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
    if (devkit.isNotExistFile(loggerPath)) {
      fs.writeFile(loggerPath, "", (err) => {
        console.log(err);
      })
    }
    if (devkit.isNotEmpty(detectionData)) {
      fs.appendFileSync(loggerPath, JSON.stringify(detectionData));
    }
  }

  static async getDetectionData(searchBeaconID, searchTimes, byJson) {
    if (byJson) {
      const dateNow = devkit.getDate2ymd();
      const detectionDatas = this.getDetectionDataByJson(searchBeaconID, searchTimes, dateNow);
      if (devkit.isNotEmpty(detectionDatas)) {
        return detectionDatas;
      }
    }
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
    if (devkit.isNotExistFile(logPath)) {
      return null;
    }
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
    const db = client.db(DBName);
    const res = await db
      .collection("detectionData")
      .deleteMany({});
    client.close();
    console.log("deleteDetectionData: DB");
    const dateTime = devkit.getDate2ymd(undefined, true);
    const logName = dateTime + ".json"
    const logPath = path.join('/var/log/', logName);
    devkit.deleteFile(logPath);
    console.log("deleteDetectionData: LogData")
    return res.result;
  }
  //受信機ログ全データの読み込み関数
  static async detectorLog2Json() {
    return new Promise((resolve, reject) => {
      let log2json = [];
      let tasks = [];
      console.log("detectorLog2Json: Read");
      for (let detectorNumber = 1; detectorNumber <= 5; detectorNumber++) { //個数を指定する
        tasks.push(this.intermediateFile(detectorNumber).catch(() => {
          return reject(`detectorLog2Json: DetectorNo${detectorNumber} cant task push`);
        }).then(() => {
          console.log(`DetectorNo${detectorNumber} intermadiateFile task push ok`);
        }));
        tasks.push(this.readCsvFileData(detectorNumber).catch(() => {
          return reject(`detectorLog2Json: DetectorNo${detectorNumber} cant task push`);
        }).then(result => {
          console.log(`DetectorNo${detectorNumber} read ok`);
          log2json = log2json.concat(result);
        }))
      }
      Promise.all(tasks).catch(() => {
        return reject(`detectorLog2Json: DetectorNo${detectorNumber} reject`)
      }).then(result => {
        resolve(log2json);
      })
    })
  }
  //中間ファイル作成
  static async intermediateFile(detectorNumber) {
    console.log("intermediateFile: process");
    const allDetectionDatas = await this.readCsvFileData(detectorNumber)
    let startTime = Number(allDetectionDatas[0].detectedTime);
    startTime = Math.floor(startTime/1000) * 1000;
    const endTime = startTime + 86400000;
    const fixedDetectionDatas = [];
    while(endTime >= startTime) {
      const calcTimeQuery = {
        start: startTime,
        end: startTime + 1000
      };
      startTime += 1000;
      const detectionDatas = devkit.getBetweenTime(calcTimeQuery, allDetectionDatas);
      if (devkit.isEmpty(detectionDatas)) {
        continue;
      }
      let aveRSSI = 0;
      for (let detectionData of detectionDatas) {
        aveRSSI += detectionData.RSSI;
      }
      aveRSSI /= detectionDatas.length;
      const fixedDetectionData = {
        "detectorNumber": detectorNum,
        "RSSI": aveRSSI,
        "TxPower": dataGroupByDetectorNum[detectorNum][0].TxPower,
        "numOfDataForAve": sortedDetectorData.length,
        "detectedTime": startTime
      };
      fixedDetectionDatas.push(fixedDetectionData);
    }
    fs.writeFile(`./var/detector/No${detectorNumber}_${devkit.getDate2ymd(undefined, true, false)}.log`, fixedDetectionDatas);
  }
  //受信機ログCSV読み込みの関数
  static readCsvFileData(detectorNumber) {
    const date = devkit.getDate2ymd(null, true, false); //デバッグ時マジックナンバーが必要
    return new Promise((resolve, reject) => {
      const logName = `No${detectorNumber}_${date}.log`;
      const logPath = path.join('./var/detector', logName);
      let tmp = [];
      if(devkit.isNotExistFile(logPath)) {
        return reject();
      }
      console.log("readCsvFileData: Reading");
      const rs = fs.createReadStream(logPath);
      const rl = readline.createInterface(rs, {});
      rl.on('line', line => {
        const contents = line.split(",");
        const jsonObj = {
          "detectorNumber": Number(contents[0]),
          "RSSI": Number(contents[3]),
          "TxPower": Number(contents[2]),
          "beaconID": contents[1],
          "detectedTime": contents[4]
        }
        tmp.push(jsonObj);
      });
      rl.on('close', () => {
        return resolve(tmp);
      });
    })
  }

  static async uploadData2Server(uploadData) {
    console.log(`uploadData2Server: ${uploadData.originalname}`);
  }
};
