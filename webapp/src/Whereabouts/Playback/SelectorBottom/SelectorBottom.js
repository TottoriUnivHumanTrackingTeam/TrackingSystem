import React, { useState, useEffect, useRef } from 'react';

import TimeSlider from './TimeSlider';
import PlaybackButton from './PlaybackButton';
import _ from 'underscore';

export default function PlaybackSelectorBottom(props) {
  const [time, setTime] = useState(0);
  const refTime = useRef(time);
  const [timeLine, setTimeLine] = useState([]);
  const [timerID, setTimerID] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [errorTime, setErrorTime] = useState([]);

  useEffect(() => {
    const largestLocationTracker = _.max(props.trackers, tracker => {
      return tracker.Location.length;
    });
    const times = _.map(largestLocationTracker.Location, location => {
      return location.locatedTime;
    });
    times.reverse();
    setTimeLine(times);
    //プレイバック機能のデータ飛び時の再生停止機能
    //24時間分を超えると処理に時間がかかる
    const errTimeLocation = _.map(largestLocationTracker.Location, location => {
      if(location.alert){
        return location.locatedTime;
      }
    });
    const errorArray = [];
    times.forEach((checkTime,idx) => {
      if(errTimeLocation.includes(checkTime)){
        errorArray.push(idx);
      }
    });
    setErrorTime(errorArray);
  }, [props.trackers]);

  useEffect(() => {
    props.onChange(timeLine[time]);
  });

  //プレイバック機能のデータ飛び時の再生停止機能
  useEffect(() => {
    if(errorTime.includes(refTime.current)){
      clearInterval(timerID);
    }
  }, [refTime.current]);

  useEffect(() => {
    refTime.current = time;
  }, [time, timerID]);

  useEffect(() => {
    return () => clearInterval(timerID);
  }, [timerID]);

  const startPlayback = () => {
    clearInterval(timerID);
    setTimerID(
      setInterval(() => {
        setTime(refTime.current !== timeLine.length - 1 ? refTime.current + 1 : refTime.current);
      }, speed)
    );
  };

  const rewindPlayback = () => {
    clearInterval(timerID);
    setTimerID(
      setInterval(() => {
        setTime(refTime.current !== 0 ? refTime.current - 1 : refTime.current);
      }, speed)
    );
  };

  const stopPlayback = () => {
    clearInterval(timerID);
  };

  return (
    <div className="PlaybackSelectorBottom">
      <TimeSlider timeline={timeLine} time={time} onChange={setTime} />
      <br />
      <PlaybackButton
        startPlayback={startPlayback}
        rewindPlayback={rewindPlayback}
        stopPlayback={stopPlayback}
        setSpeed={setSpeed}
        speed={speed}
      />
    </div>
  );
}
