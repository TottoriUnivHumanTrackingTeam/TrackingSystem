'use strict';

const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const Map = require('./Map');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const DBName = config.DB.Name;
const DBURL = config.DB.URL + '/' + DBName;

module.exports = class MapRepository {
    static async addMap(mapData) {
        const newMap = new Map(mapData["name"], mapData["size"], mapData["mname"]);

        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const res = await db.collection('map').insert(newMap);
        const map = await db.collection('map').findOne({name: newMap.name});
        client.close();
        return map;
    }

    static async removeMap(searchedMapName) {
        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const removeQuery = {name: searchedMapName};
        const res = await db.collection('map').remove(removeQuery);
        client.close();
    }

    static async getMap(searchedMapName) {
        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const searchQuery = {name: searchedMapName};
        const map = await db.collection('map').findOne(searchQuery);
        client.close();
        return map;
    }

    static async getAllMap() {
        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const mapQuery = await db.collection('map').find().toArray();
        client.close();
        let maps = [];
        for(let map of mapQuery) {
            maps.push(map);
        }
        return maps;
    }
};
