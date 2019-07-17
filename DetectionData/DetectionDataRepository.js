'use strict';

//detecterからのデータなので基本的に削除, 変更はしない
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const DetectionData = require('./DetectionData');
const _ = require('underscore');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const DBName = config.DB.Name;
const DBURL = config.DB.URL + '/' + DBName;

module.exports = class DetectionDataRepository {
  static async addDetectionData(putDetectionData) {
      const detectionData = _.map(putDetectionData, (data) => {
        return new DetectionData ( Number(data["detectorNumber"]), Number(data["rssi"]), Number(data["measuredPower"]),
                                   data["beaconID"], data["detectedTime"] );
      });
      const client = await MongoClient.connect(DBURL)
          .catch((err) => {
              console.log(err);
          });
      const db = client.db(DBName);
      const res = await db.collection('detectionData').insertMany(detectionData);
      client.close();
      return res.result;
  }

  static async getDetectionData(searchBeaconID, searchTimes) {
    const client = await MongoClient.connect(DBURL)
    .catch((err) => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = {$and: [{detectedTime: {$lte: searchTimes["end"], $gte: searchTimes["start"]}},
                                {beaconID: searchBeaconID}]};
    const detectionDataQuery = await db.collection('detectionData').find(searchQuery).toArray();
    client.close();
    let detectionDatas = [];
    for(let detectionData of detectionDataQuery) {
      detectionDatas.push(detectionData);
    }
    return detectionDatas;
  }
};
