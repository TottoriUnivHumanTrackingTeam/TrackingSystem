import React from 'react';
import Button from '@material-ui/core/Button';

export default function TrackingButton(props) {
    const startTracking = () => {
        fetch(`${process.env.REACT_APP_API_URL}/api/tracking/start`)
            .catch((err) => {console.log(err)})
    }

    return (
        <Button
            varian="contained"
            color="primary"
            className="StartTracking"
            onClick={startTracking}
        >
            トラッキングスタート
        </Button>
    )
}