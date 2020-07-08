import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import jaLocale from 'date-fns/locale/ja';
import 'date-fns';
import { DatePicker, TimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

export default function MaterialUIPickers(props) {
  const [selectDate, setSelectDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime,setEndTime] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const send = () => {
    const term = {
      start: startDate.getTime(),
      end: endDate.getTime()
    };
    props.onSend(term);
  };

  useEffect(() => {
    const selectStartDate = new Date();
    selectStartDate.setFullYear(selectDate.getFullYear());
    selectStartDate.setMonth(selectDate.getMonth());
    selectStartDate.setDate(selectDate.getDate());
    selectStartDate.setHours(startTime.getHours());
    selectStartDate.setMinutes(startTime.getMinutes());
    selectStartDate.setSeconds(startTime.getSeconds());
    selectStartDate.setMilliseconds(startTime.getMilliseconds());
    setStartDate(selectStartDate);
  }, [selectDate, startTime]);

  useEffect(() => {
    const selectEndDate = new Date();
    selectEndDate.setFullYear(selectDate.getFullYear());
    selectEndDate.setMonth(selectDate.getMonth());
    selectEndDate.setDate(selectDate.getDate());
    selectEndDate.setHours(endTime.getHours());
    selectEndDate.setMinutes(endTime.getMinutes());
    selectEndDate.setSeconds(endTime.getSeconds());
    selectEndDate.setMilliseconds(endTime.getMilliseconds());
    setEndDate(selectEndDate);
  }, [selectDate, endTime]);

  useEffect(send, [endDate]);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={jaLocale}>
      <Grid container justify="space-around">
        <DatePicker
          variant="inline"
          label="日付"
          format="yyyy/MM/dd"
          value={selectDate}
          onChange={date => {
            setSelectDate(date);
          }}
        />
      </Grid>
      <br />
      <Grid container justify="space-around">
        <TimePicker
          variant="inline"
          label="開始時間"
          format="HH:mm"
          value={startTime}
          onChange={date => {
            setStartTime(date);
            setEndTime(date);
          }}
        />
      </Grid>
      <br />
      <Grid container justify="space-around">
        <TimePicker
          variant="inline"
          label="終了時間"
          format="HH:mm"
          value={endTime}
          onChange={date => setEndTime(date)}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
