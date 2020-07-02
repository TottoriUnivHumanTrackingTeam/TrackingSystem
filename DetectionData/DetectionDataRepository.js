"use strict";

//detecterからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const _ = require("underscore");
const MongoClient = require("mongodb").MongoClient;
const DetectionData = require("./DetectionData");

const fs = require("fs");
const path = require("path");
const readline = require("readline")

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

const isExistFile = (file) => {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

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
    if (!isExistFile(logPath)) {
      fs.writeFile(logPath, "", (err) => {
        console.log(err);
      });
    };
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
  static async deleteAllDetectionData() {
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
  //Detectorのログ解析
  static async detectorLog2Json() {
    return new Promise((resolve, reject) => {
      const dt = new Date();
      dt.setDate(dt.getDate()-1)
      const y = dt.getFullYear();
      const m = dt.getMonth()+1;
      const d = 23//dt.getDate(); //生データの前日の日付（23はマジックナンバー）
      let log2json = []
      //CSVログファイル読み込みの内部関数
      function readData(detectorNumber) {
        return new Promise((resolve, reject) => {
          const logName = `No${detectorNumber}_${y}_${m}_${d}.log`;
          const logPath = path.join('./var/detector/', logName)
          const tmp = []
          if (!isExistFile(logPath)) {
            reject();
          } else { 
            const rs = fs.createReadStream(logPath);
            const rl = readline.createInterface(rs, {});
            rl.on('line', (line) => {
              const contents = line.split(",")
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
              resolve(tmp)
            })
          }
        })
      }
      const tasks = []
      //受信機数分読み込む(25はマジックナンバー)
      for (let detectorNumber = 1; detectorNumber <= 25; detectorNumber++) {
        tasks.push(readData(detectorNumber).then(result => {
          console.log(`DetectorNo${detectorNumber} read ok`)
          log2json = log2json.concat(result)
        }))
      }
      Promise.allSettled(tasks).then(results => {
        resolve(log2json);
      })
    })
  }
  //ファイル削除
  static async deleteFileDetectionData() {
    const dt = new Date();
    dt.setDate(dt.getDate()-1)
    const y = dt.getFullYear();
    const m = ("00" + (dt.getMonth()+1)).slice(-2);
    const d = ("00" + dt.getDate()).slice(-2);
    const dateNow = y + m + d;
    const logName = dateNow + ".json";
    const logPath = path.join('./var/log/', logName)
    fs.unlinkSync(logPath)
  }
};
