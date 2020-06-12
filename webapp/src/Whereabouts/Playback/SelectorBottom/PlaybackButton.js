import React from 'react';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';

export default function PlaybackButton(props) {
  return (
    <Grid container className="PlaybackButton" spacing={2}>
      <Grid key="Play" item>
        <Button
          variant="contained"
          color="primary"
          className="StartPlayback"
          onClick={props.startPlayback}
        >
          再生
        </Button>
      </Grid>

      <Grid key="Rewind" item>
        <Button
          variant="contained"
          color="primary"
          className="RewindPlayback"
          onClick={props.rewindPlayback}
        >
          巻き戻し
        </Button>
      </Grid>

      <Grid key="Stop" item>
        <Button
          variant="contained"
          color="primary"
          className="StopPlayback"
          onClick={props.stopPlayback}
        >
          停止
        </Button>
      </Grid>

      <Grid key="Speed" item>
        <Select value={props.speed} onChange={(event, value) => props.setSpeed(event.target.value)}>
          <MenuItem value={1000}>等速</MenuItem>
          <MenuItem value={500}>2倍速</MenuItem>
          <MenuItem value={200}>5倍速</MenuItem>
          <MenuItem value={100}>10倍速</MenuItem>
          <MenuItem value={10}>100倍速</MenuItem>
        </Select>
      </Grid>
    </Grid>
  );
}
