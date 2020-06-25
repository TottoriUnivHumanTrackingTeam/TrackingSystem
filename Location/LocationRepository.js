"use strict";

//Detectorからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const Location = require("./Location");

const path = require('path');
const fs = require('fs');

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class LocationRepository {
  static async addLocation(putLocation, insertLocation="location") {
    const location = new Location(
      putLocation["beaconID"],
      putLocation["grid"],
      putLocation["map"],
      putLocation["time"]
    );

    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection(insertLocation).insert(location);
    client.close();
    return res.result;
  }
  // FIX ME: Locationの取得条件を複合的に指定できるように関数を作り変える
  static async getLocationByTime(searchBeaconID, searchTimes, searchLocation="location") {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = {
      $and: [
        {
          locatedTime: { $lte: searchTimes["end"], $gte: searchTimes["start"] }
        },
        { beaconID: searchBeaconID }
      ]
    };
    const locationQuery = await db
      .collection(searchLocation)
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      locations.push(location);
    }
    return locations;
  }

  static async getLocationByTimeAndMap(mapID, searchTimes) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = {
      $and: [
        {
          locatedTime: { $lte: searchTimes["end"], $gte: searchTimes["start"] }
        },
        { map: mapID }
      ]
    };
    const locationQuery = await db
      .collection("location")
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      locations.push(location);
    }
    return locations;
  }

  static async getLocationByBeaconIDOnly(searchBeaconID) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { beaconID: searchBeaconID };
    const locationQuery = await db
      .collection("location")
      .find(searchQuery)
      .toArray();
    client.close();
    let locations = [];
    for (let location of locationQuery) {
      locations.push(location);
    }
    return locations;
  }

  static async getLocationRecently(searchBeaconID) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { beaconID: searchBeaconID };
    const locationQuery = await db
      .collection("location")
      .find(searchQuery)
      .sort({ locatedTime: -1 })
      .limit(1)
      .toArray();

    client.close();
    return locationQuery[0];
  }
  //LocationをJson形式でローカル保存
  static async transferDocument(){
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const locationDataQuery = await db
      .collection("location")
      .find()
      .toArray();
    client.close();
    let locationDatas = [];
    for (let locationData of locationDataQuery){
      locationDatas.push(locationData);
    }
    const dt = new Date();
    const y = dt.getFullYear();
    const m = ("00" + (dt.getMonth()+1)).slice(-2);
    const d = ("00" + dt.getDate()).slice(-2);
    const dateNow = y + m + d;
    const logName = dateNow + ".log";
    const loggerPath = path.join("./var/location", logName);
    const jsonData = JSON.stringify(locationDatas, null, ' ');
    fs.writeFile(loggerPath, jsonData, (err) => {
      if (err){
        console.log(err);
      }
    });
  }
  //LocationをDBから全件削除
  static async deleteAllLocation(){
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db
      .collection("location")
      .deleteMany({});
    client.close();
    return res.result;
  }
  //ローカル保存のjsonを必要時にDBへ押し込む(searchDateは日付)
  static async loadAndDeployJsonLocation(searchDate){
    const loggerPath = path.join(path.dirname(__dirname), "/var/log");
    const logName = searchDate + ".json"
    const jsonObject = JSON.parse(fs.readFileSync(path.join(loggerPath, logName), (err) => {
      console.log(err);
    }));
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db
      .collection("temporaryLocation")
      .insertMany(jsonObject);
    client.close();
    return res.result;
  }
};
