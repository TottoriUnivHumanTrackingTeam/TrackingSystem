import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Movement from './Movement/Movement';
import MovementHeatmap from './MovementHeatMap/MovementHeatmapRoot';
import StayTimes from './StayTimes/StayTimesRoot';
import HeatMap from './HeatMap/HeatMap';
export default function Whereabouts() {
  return (
    <div className="Whereabouts">
      <Tabs>
        <TabList>
          <Tab>時系列</Tab>
          <Tab>時系列ヒートマップ</Tab>
          <Tab>滞在時間</Tab>
          <Tab>ヒートマップ</Tab>
        </TabList>

        <TabPanel>
          <Movement />
        </TabPanel>
        <TabPanel>
          <MovementHeatmap />
        </TabPanel>
        <TabPanel>
          <StayTimes />
        </TabPanel>
        <TabPanel>
          <HeatMap />
        </TabPanel>
      </Tabs>
    </div>
  );
}
