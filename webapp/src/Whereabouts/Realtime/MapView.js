import React, { useState, useEffect, useCallback, useRef } from 'react';
import fetch from 'node-fetch';

import P5Wrapper from 'react-p5-wrapper';
import Map from '../Map';
import AlertBuzzer from './AlertBuzzer';

export default function RealtimeMapView(props) {
  const [trackers, setTrackers] = useState([]);
  const [timerID, setTimerID] = useState(0);
  const refTimerID = useRef(timerID);

  useEffect(() => {
    refTimerID.current = timerID;
  }, [timerID]);

  const fetchTrackers = useCallback(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/tracker`)
      .then(res => res.json())
      .then(json => {
        json = json.filter(tracker => {
          // eslint-disable-next-line no-unused-vars
          for (let chosen of props.chosenTrackers) {
            if (tracker.trackerID === chosen.ID) {
              return true;
            }
          }
          return false;
        });
        setTrackers(json);
      });
  }, [props.chosenTrackers]);

  useEffect(() => {
    clearInterval(refTimerID.current);
    setTimerID(setInterval(fetchTrackers, 1000));
    return () => clearInterval(refTimerID.current);
  }, [fetchTrackers]);

  return (
    <div className="MapView">
      <P5Wrapper sketch={Map} trackers={trackers} />
      {/*<AlertBuzzer trackers={trackers} />*/}
    </div>
  );
}
