import React, { useEffect, useState, useCallback } from 'react';
import _, { map, filter} from 'underscore';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import './MovementTable.scss';
import TermSelector from '../TermSelector';
import OnlyTrackerSelector from './OnlyTrackerSelector';

export default function MovementTable(props) {
  const [term, setTerm] = useState({});
  const [locations, setLocations] = useState([]);
  const [chosenTracker, setChosenTracker] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [locationListRender, setLocationListRender] = useState();

  const unixTime2ymd = intTime => {
    const d = new Date(intTime);
    const hour = ('0' + d.getHours()).slice(-2);
    const min = ('0' + d.getMinutes()).slice(-2);
    const sec = ('0' + d.getSeconds()).slice(-2);

    return hour + ':' + min + ':' + sec;
  };

  const fetchTracker = (term, tracker) => {
    const url = new URL(`${process.env.REACT_APP_API_URL}/api/tracker/${tracker.ID}`);
    Object.keys(term).forEach(key => url.searchParams.append(key, term[key]));
    url.searchParams.append('needMapName', true);
    fetch(url)
      .then(res => res.json())
      .then(json => {
        setLocations(json.Location);
      });
  };

  const makeList = useCallback(() => {
    const list = [];
    let name = "none";
    let count = 0;
    let recentlyTime;
    for (let time = term.start; time <= term.end; time += 60000) {
      const selectLocation = _.filter(locations, location => {
        return location.locatedTime >= time && location.locatedTime < time + 60000;
      });
      const locationMaps = _.map(selectLocation, location => {
        return location.map;
      });
      if(locationMaps.length >= 5){
        const nowMap = mode(locationMaps);
        if(name !== nowMap){
          if(time !== term.start){
            list.push({
              time: `${unixTime2ymd(time - count)} ~ ${unixTime2ymd(time)}`,
              mapName: name
            });
          }
          count = 60000;
          name = nowMap;
        }else{
          count += 60000;
        }
      }else{
        if(name === "うぐいすユニット" || name === "施設外"){
          count += 60000;
        }else if(name !== "none"){
          list.push({
            time: `${unixTime2ymd(time - count)} ~ ${unixTime2ymd(time)}`,
            mapName: name
          });
          name = "none"
          count = 60000;
        }else{
          count += 60000;
        }
      }
      setLocationList(list);
      recentlyTime = time + 60000;
    }
    if(recentlyTime !== term.start){
      list.push({
        time: `${unixTime2ymd(recentlyTime - count)} ~ ${unixTime2ymd(recentlyTime)}`,
        mapName: name
      });
      setLocationList(list);
    }
  }, [locations]);

  const makeMapList = (map) => {
    return map;
  };

  const mode = (locationMaps) => {
    let maps = [];
    let fly = false;
    let anotherRoom = false;
    let anotherRoomName = "";
    locationMaps.forEach((mapName) => {
      if(mapName === "うぐいすユニット" || mapName === "施設外"){
        anotherRoom = true;
        anotherRoomName = mapName;
      }
      for(let i=0; i<maps.length; i++){
        if(maps[i][0] === mapName){
          maps[i][1] += 1;
          fly = true;
        }
      }
      if(!fly){
        maps.push([mapName, 1]);
      }else{
        fly = false;
      }
    });
    let modeMap = 0;
    let modeNum = 0;
    for(let i=0; i<maps.length; i++){
      if(maps[i][1] > modeMap){
        modeMap = maps[i][1];
        modeNum = i;
      }
    }
    if(anotherRoom){
      return anotherRoomName;
    }
    return maps[modeNum][0];
  };

  useEffect(() => {
    makeList();
  }, [makeList, locations]);

  useEffect(() => {
    if (Object.keys(chosenTracker).length && Object.keys(term).length) {
      fetchTracker(term, chosenTracker); 
    }
  }, [chosenTracker, term]);

  useEffect(() => {
    if (locationList.length) {
      setLocationListRender(
        <Paper className="Root">
          <Table className="Table" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">時間</TableCell>
                <TableCell align="center">場所</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locationList.map(row => (
                <TableRow key={row.time}>
                  <TableCell component="th" scope="row" align="center">
                    {row.time}
                  </TableCell>
                  <TableCell align="center">{makeMapList(row.mapName)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      );
    }
  }, [locationList]);

  return (
    <div className="Movement">
      <div className="SideSelector">
        <OnlyTrackerSelector className="TrackerSelector" onChange={setChosenTracker} />
        <br />
        <TermSelector className="TermSelector" onSend={setTerm} />
      </div>
      <div className="List">{locationListRender}</div>
    </div>
  );
}