import React, { useEffect, useState, useCallback } from 'react';
import _ from 'underscore';
import './ListUpTrackerByMap.scss';
import TermSelector from '../TermSelector';
import MapSelector from './MapSelector';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function ListUpTrackerByMap(props) {
  const [map, setMap] = useState({});
  const [term, setTerm] = useState({});
  const [locations, setLocation] = useState([]);
  const [trackers, setTracker] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [locationListRender, setLocationListRender] = useState();

  const unixTime2ymd = intTime => {
    const d = new Date(intTime);
    const hour = ('0' + d.getHours()).slice(-2);
    const min = ('0' + d.getMinutes()).slice(-2);
    const sec = ('0' + d.getSeconds()).slice(-2);

    return hour + ':' + min + ':' + sec;
  };

  const fetchLocationByMap = (map, term) => {
    const url = new URL(`${process.env.REACT_APP_API_URL}/api/location/${map.ID}`);
    Object.keys(term).forEach(key => url.searchParams.append(key, term[key]));
    fetch(url)
      .then(res => res.json())
      .then(json => {
        setLocation(json);
      });
  };

  const fetchTrackerByLocation = async location => {
    const indexedLocation = _.groupBy(location, data => {
      return data.beaconID;
    });
    const beaconIDList = _.keys(indexedLocation);
    let trackerList = [];

    // eslint-disable-next-line no-unused-vars
    for (let beaconID of beaconIDList) {
      const url = new URL(`${process.env.REACT_APP_API_URL}/api/tracker/beacon/${beaconID}`);
      const res = await fetch(url);
      let data = await res.json();

      trackerList.push(data);
    }

    trackerList = trackerList.map(tracker => {
      return {
        ID: tracker.trackerID,
        beaconID: tracker.beaconID,
        name: tracker.trackerName,
        image: tracker.userImage,
        status: tracker.userStatus
      };
    });

    return trackerList;
  };

  const makeList = useCallback(() => {
    const list = [];
    for (let time = term.start; time < term.end; time += 300000) {
      const location = locations.filter(
        location => location.locatedTime >= time && location.locatedTime < time + 300000
      );
      const indexedLocation = _.groupBy(location, data => {
        return data.beaconID;
      });
      const beaconIDList = _.keys(indexedLocation);
      const trackerList = [];
      beaconIDList.forEach(beaconID => {
        trackerList.push(
          trackers.find(tracker => {
            return tracker.beaconID === beaconID;
          })
        );
      });
      list.push({
        time: `${unixTime2ymd(time)} ~ ${unixTime2ymd(time + 300000)}`,
        trackers: trackerList
      });
      setLocationList(list);
    }
  }, [trackers]);

  const makeNameList = (trackers, staffOnly = false) => {
    if (staffOnly) {
      trackers = trackers.filter(tracker => {
        return tracker.status === '職員'; //Fix：職員からstaffに変更したい(trackerのstatusも変更)
      });
    } else {
      trackers = trackers.filter(tracker => {
        return tracker.status === '入居者'; //Fix：入居者からtenantに変更したい(同上)
      });
    }
    if (trackers.length) {
      const trackerNames = trackers.map(tracker => {
        return tracker.name;
      });
      return trackerNames.join(', ');
    } else {
      return 'なし';
    }
  };

  useEffect(() => {
    fetchTrackerByLocation(locations).then(trackerList => {
      setTracker(trackerList);
    });
  }, [locations]);

  useEffect(() => {
    makeList();
  }, [makeList, trackers]);

  useEffect(() => {
    if (!_.isEmpty(map)) {
      fetchLocationByMap(map, term);
    }
  }, [map, term]);

  useEffect(() => {
    if (locationList.length) {
      setLocationListRender(
        <Paper className="Root">
          <Table className="Table" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">時間</TableCell>
                <TableCell align="center">職員</TableCell>
                <TableCell align="center">入居者</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locationList.map(row => (
                <TableRow key={row.time}>
                  <TableCell component="th" scope="row" align="center">
                    {row.time}
                  </TableCell>
                  <TableCell align="center">{makeNameList(row.trackers, true)}</TableCell>
                  <TableCell align="center">{makeNameList(row.trackers)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      );
    }
  }, [locationList]);

  return (
    <div className="ListUpTrackerByMap">
      <div className="Selector">
        <div className="TermSelector">
          <TermSelector onSend={setTerm} />
        </div>
        <br />
        <div className="MapSelector">
          <MapSelector onSend={setMap} />
        </div>
      </div>
      <div className="List">{locationListRender}</div>
    </div>
  );
}
