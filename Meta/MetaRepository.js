'use strict';

const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const Meta = require('./Meta');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const DBName = config.DB.Name;
const DBURL = config.DB.URL + '/' + DBName;

module.exports = class MetaRepository {
    static async addMeta(metaData) {
        const meta = new Meta(metaData["name"], metaData["size"]);

        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const res = await db.collection('meta').insert(meta);
        client.close();
        return res.result;
    }

    static async removeMeta(searchedMetaName) {
        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const removeQuery = {name: searchedMetaName};
        const res = await db.collection('meta').remove(removeQuery);
        client.close();
    }

    static async getMeta(searchedMetaName) {
        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const searchQuery = {name: searchedMetaName};
        const meta = await db.collection('meta').findOne(searchQuery);
        client.close();
        return meta;
    }

    static async getAllMeta() {
        const client = await MongoClient.connect(DBURL)
            .catch((err) => {
                console.log(err);
            });
        const db = client.db(DBName);
        const metaQuery = await db.collection('meta').find().toArray();
        client.close();
        let metas = [];
        for(let meta of metaQuery) {
            metas.push(meta);
        }
        return metas;
    }

    static async updateMeta(metaData) {
        const client = await MongoClient.connect(DBURL)
        .catch((err) => {
          console.log(err);
        });
        const db = client.db(DBName);
        const mName = metaData[0];
        const mapID = metaData[1];
        const res = await db.collection('meta').update({name:mName},{$set:{"mapIDList":mapID}});
        client.close();
        return res.result;
    }
};
