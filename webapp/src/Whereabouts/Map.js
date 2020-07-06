export default function sketch(p) {
  let backImage;

  let trackers = [];

  p.setup = function() {
    p.createCanvas(
      `${process.env.REACT_APP_API_MAP_WIDTH}`,
      `${process.env.REACT_APP_API_MAP_HEIGHT}`
    );
    backImage = p.loadImage(`${process.env.REACT_APP_API_URL}/${process.env.REACT_APP_API_MAP}`);
  };

  p.myCustomRedrawAccordingToNewPropsHandler = function(props) {
    if (props.trackers) {
      trackers = props.trackers;
      trackers.forEach(tracker => {
        tracker.image = p.loadImage('data:image/png;base64,' + tracker.userImage);
      });
    }
  };

  p.draw = function() {
    p.background(255);
    p.noTint();
    p.image(backImage, 0, 0, 0);
    if (trackers.length) {
      trackers.forEach(tracker => {
        if (tracker.Location && Object.keys(tracker.Location).length) {
          if (tracker.alert.keepOut) {
            p.textSize(20);
            p.fill(p.color('red'));
            p.textAlign(p.LEFT, p.TOP);
            p.text(
              tracker.trackerName + 'さんが立入禁止区域に侵入しています！',
              tracker.Location.grid.x + 30,
              tracker.Location.grid.y + 30
            );
            p.tint('red');
            p.image(tracker.image, tracker.Location.grid.x, tracker.Location.grid.y);
          } else if (tracker.alert.lost) {
            p.textSize(20);
            p.fill(p.color('red'));
            p.textAlign(p.LEFT, p.TOP);
            p.text(
              tracker.trackerName + 'さんを見失いました！',
              tracker.Location.grid.x + 30,
              tracker.Location.grid.y + 30
            );
            p.tint('red');
            p.image(tracker.image, tracker.Location.grid.x, tracker.Location.grid.y);
          } else if (tracker.alert.schedule) {
            p.textSize(20);
            p.fill(p.color('red'));
            p.textAlign(p.LEFT, p.TOP);
            p.text(
              tracker.trackerName + 'さんが予定とは違う場所にいます！',
              tracker.Location.grid.x + 30,
              tracker.Location.grid.y + 30
            );
            p.tint('red');
            p.image(tracker.image, tracker.Location.grid.x, tracker.Location.grid.y);
          }else if(tracker.Location.alert){
            p.textSize(20);
            p.fill(p.color('red'));
            p.textAlign(p.LEFT, p.TOP);
            p.text(
              tracker.trackerName + 'さんを見失いました！',
              tracker.Location.grid.x + 30,
              tracker.Location.grid.y + 30
            );
            p.tint('red');
            p.image(tracker.image, tracker.Location.grid.x, tracker.Location.grid.y);
          } else {
            p.noTint();
            p.image(tracker.image, tracker.Location.grid.x, tracker.Location.grid.y);
          }
          if (
            p.mouseX - 12 < tracker.Location.grid.x + 10 &&
            tracker.Location.grid.x - 10 < p.mouseX - 12
          ) {
            if (
              p.mouseY - 12 < tracker.Location.grid.y + 10 &&
              tracker.Location.grid.y - 10 < p.mouseY - 12
            ) {
              p.textSize(20);
              if (tracker.userStatus === 'staff') {
                p.fill(p.color('blue'));
              } else {
                p.fill(p.color('black'));
              }
              p.textAlign(p.LEFT, p.TOP);
              p.text(
                tracker.trackerName + '\n' + unixTime2ymd(tracker.Location.locatedTime),
                tracker.Location.grid.x + 30,
                tracker.Location.grid.y + 30
              );
            }
          }
        }
      });
    }
  };

  const unixTime2ymd = function unixTime2ymd(intTime) {
    const d = new Date(intTime);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = ('0' + d.getHours()).slice(-2);
    const min = ('0' + d.getMinutes()).slice(-2);
    const sec = ('0' + d.getSeconds()).slice(-2);

    return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
  };
}
