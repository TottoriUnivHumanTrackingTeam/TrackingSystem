"use strict";

require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const Map = require("./Map");

const DBName = process.env.DB_NAME || "tracking";
const DBURL = process.env.DB_URL + DBName || "mongodb://localhost:27017/" + DBName;

module.exports = class MapRepository {
  static async addMap(mapData) {
    const newMap = new Map(mapData["name"], mapData["size"], mapData["mName"]);
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const res = await db.collection("map").insert(newMap);
    const map = await db.collection("map").findOne({ name: newMap.name });
    client.close();
    return map;
  }

  static async removeMap(searchedMapName) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const removeQuery = { name: searchedMapName };
    const res = await db.collection("map").remove(removeQuery);
    client.close();
  }

  static async getMap(searchedMapID) {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const searchQuery = { mapID: searchedMapID };
    const map = await db.collection("map").findOne(searchQuery);
    client.close();
    return map;
  }

  static async getAllMap() {
    const client = await MongoClient.connect(DBURL).catch(err => {
      console.log(err);
    });
    const db = client.db(DBName);
    const mapQuery = await db
      .collection("map")
      .find()
      .toArray();
    client.close();
    let maps = [];
    for (let map of mapQuery) {
      maps.push(map);
    }
    return maps;
  }
};
