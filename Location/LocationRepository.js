"use strict";

//Detectorからのデータなので基本的に削除, 変更はしない
require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const Location = require("./Location");

const devkit = require('../devkit');
const path = require('path');
const fs = require('fs');

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class LocationRepository {
  static async addLocation(putLocation, insertLocation) {
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
  static async getLocationByTime(searchBeaconID, searchTimes, searchLocation) {
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

  static async logTransfer(applyLocation) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    })
    const db = client.db(DBName);
    const locationDataQuery = await db
      .collection(applyLocation)
      .find()
      .toArray();
    client.close();
    let locationDatas = [];
    for (let locationData of locationDataQuery) {
      locationDatas.push(locationData);
    }
    console.log("logTransfer: DataRead");
    const dateNow = devkit.getDate2ymd();
    const logName = dateNow + ".log";
    let loggerPath = (applyLocation == "location") ? 
      path.join("./var/location", logName) :
      path.join("./var/updatelocation", logName);
    const jsonData = JSON.stringify(locationDatas, null, ' ');
    fs.writeFile(loggerPath, jsonData, err => {
      if (err) {
        console.log(err);
      }
    })
    console.log("logTransfer: Written")
  }

  static async loadAndDeployLocation(searchDate) {
    console.log("loadAndDeployLocation: process")
    const logPath = path.join("./var/updatelocation");
    const logName = searchDate + ".log";
    const jsonData = JSON.parse(fs.readFileSync(path.join(logPath, logName), err => {
      console.log(err);
    }))
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    })
    const db = client.db(DBName);
    const res = await db
      .collection("temporaryLocation")
      .insertMany(jsonData);
    client.close();
    console.log("loadAndDeployLocation: deployed")
    return res.result;
  }

  static async deleteLocation(applyLocation) {
    console.log("deleteLocation: DB")
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    })
    const db = client.db(DBName);
    const res = await db
      .collection(applyLocation)
      .deleteMany({});
    client.close();
    return res.result;
  }
};
