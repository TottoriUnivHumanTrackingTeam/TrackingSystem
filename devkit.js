"use strict";

const fs = require('fs');
const path = require('path')

module.exports = class DevelopKitFunction {
  //falsy拡張([], {}がtrueになるため)
  static isEmpty(obj) {
    if (obj === undefined || obj === null) {
      return true;
    } else if (Object.prototype.toString.call(obj).slice(8, -1) === 'String') {
      if (obj === '') {
        return true;
      }
    } else if (Object.prototype.toString.call(obj).slice(8, -1) === 'Array') {
      if (obj.length === 0) {
        return true;
      }
    } else if (Object.prototype.toString.call(obj).slice(8, -1) === 'Object') {
      if (!Object.keys(obj).length) {
        return true;
      }
    }
    return false;
  }
  static isNotEmpty(obj) {
    return !this.isEmpty(obj);
  }
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
  static isNotExistFile(file) {
    return !this.isExistFile(file);
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
  static async getDirectoryList(dir, extension=true) {
    const fileList = fs.readdirSync(dir);
    const regex = /\.[^/.]+$/;
    if (extension) {
      return files;
    }
    let dirList = [];
    fileList.forEach(file => {
      dirList.push(file.replace(regex, ""))
    })
    return dirList;
  }
  //時間内データのフィルタリング
  static getBetweenTime(searchTimesQuery, objects, searchBeaconID) {
    const filtered = objects.filter(object => {
      const startBoolean = (Number(object.detectedTime) >= Number(searchTimesQuery.start));
      const endBoolean = (Number(object.detectedTime) <= Number(searchTimesQuery.end));
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
}