import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import jaLocale from 'date-fns/locale/ja';
import 'date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

export default function MaterialUIPickers(props) {
  const [selectDate, setSelectDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const send = () => {
    const term = {
      start: startDate.getTime(),
      end: endDate
    };
    props.onSend(term);
  };

  useEffect(() => {
    startDate.setFullYear(selectDate.getFullYear());
    startDate.setMonth(selectDate.getMonth());
    startDate.setDate(selectDate.getDate());
    startDate.setHours(0, 0, 0, 0);
    setStartDate(startDate);
    const endDate = startDate.getTime() + 86399999;
    setEndDate(endDate);
  }, [selectDate]);

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
    </MuiPickersUtilsProvider>
  );
}
