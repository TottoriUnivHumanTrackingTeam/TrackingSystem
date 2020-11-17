import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

export default function MovementGraphRender(props) {
  const [data, setData] = useState({});
  const [option, setOption] = useState({});

  const dynamicColors = function() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  };

  useEffect(() => {
    if (props.data.length) {
      const data = {
        labels: props.data[0].location.timeLabel,
        datasets: []
      };
      const dataset = [];
      props.data.forEach(data => {
        dataset.push({
          label: data.name,
          lineTension: 0,
          borderColor: dynamicColors(),
          fill: false,
          data: data.location.mapDatas
        });
      });
      data.datasets = dataset;
      setData(data);
    }
  }, [props.data]);

  useEffect(() => {
    if (props.data.length) {
      const options = {
        legend: {
          display: false
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              type: 'category',
              labels: props.data[0].location.mapDatas
                .filter(function(x, i, self) {
                  return self.indexOf(x) === i;
                })
                .sort()
            }
          ],
          xAxes: [
            {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10
              }
            }
          ]
        }
      };
      setOption(options);
    }
  }, [props.data]);

  return (
    <div className="Movement">
      <Line data={data} options={option} height={645} width={1020} />
    </div>
  );
}
