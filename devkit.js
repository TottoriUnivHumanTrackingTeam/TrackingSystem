"use strict";

const fs = require('fs');
const path = require('path')
const readline = require('readline');

module.exports = class DevelopKitFunction {
  //ファイルの有無確認
  static isExistFile(file) {
    try {
      fs.statSync(file);
      return true;
    } catch(err) {
      if(err.code === 'ENOENT') {
        return false;
      }
    }
  }
  //日付取得(initTimeはUnixTimeから変換, yesterdayがtrueで前日, paddingがtrueで0埋め, falseで'_'区切りの日付)
  static getDate2ymd(initTime, yesterday=false, padding=true){
    let dt = undefined;
    if (initTime) {
      dt = new Date(initTime);
    } else {
      dt = new Date();
    }
    if (yesterday) {
      dt.setDate(dt.getDate()-1)
    }
    const y = dt.getFullYear();
    if (padding){
      const m = ("00" + (dt.getMonth() + 1)).slice(-2);
      const d = ("00" + dt.getDate()).slice(-2);
      return y + m + d;
    } else {
      const m = dt.getMonth()+1;
      const d = dt.getDate();
      return y + "_" + m + "_" + d;
    }
  }
  //dir内のファイルを一覧にして表示(extensionがfalseで拡張子を非表示)
  static getDirectoryList(dir, extension=true) {
    fs.readdir(dir, (err, files) => {
      const regex = /\.[^/.]+$/;
      if (err) {
        console.log(err);
      }
      const dirList = [];
      if (extension) {
        return files;
      }
      files.forEach(file => {
        dirList.push(file.replace(regex, ""))
      })
      return dirList;
    })
  }
  //時間内データのフィルタリング
  static getBetweenTime(searchTimes, objects, searchBeaconID) {
    const filtered = objects.filter(object => {
      const startBoolean = (Number(object.detectedTime) >= Number(searchTimes.start));
      const endBoolean = (Number(object.detectedTime) <= Number(searchTimes.end));
      if (startBoolean && endBoolean) {
        if (searchBeaconID){
          if (object.beaconID === searchBeaconID) {
            return true;
          }
        }
        return true;
      }
    })
    return filtered;
  }
  //CSV読み込みの関数(特に何かない限りcsvFilePadding, yesterdayは常にfalse, true)
  static async readCsvFileData(detectorNumber, csvFilePadding=false, yesterday=true) {
    const date = `2020_6_23`;//this.getDate2ymd(yesterday, csvFilePadding);
    return new Promise((resolve, reject) => {
      const logName = `No${detectorNumber}_${date}.log`;
      const logPath = path.join('./var/detector', logName);
      const tmp = [];
      if(!this.isExistFile(logPath)) {
        return reject();
      }
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
}