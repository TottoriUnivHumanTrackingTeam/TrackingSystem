import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Realtime from './Realtime/Realtime';
import Playback from './Playback/Playback';
import ListUpTrackerByMap from './ListUpTrackerByMap/ListUpTrackerByMap';
import CompareSchedule from './CompareSchedule/CompareSchedule';
import MovementTable from './MovementTable/MovementTable';

export default function Whereabouts() {
  return (
    <div className="Whereabouts">
      <Tabs>
        <TabList>
          <Tab>リアルタイム</Tab>
          <Tab>プレイバック</Tab>
          <Tab>入居者所在検索</Tab>
          <Tab>スケジュール比較</Tab>
          <Tab>入居者日別所在履歴</Tab>
        </TabList>

        <TabPanel>
          <Realtime />
        </TabPanel>
        <TabPanel>
          <Playback />
        </TabPanel>
        <TabPanel>
          <ListUpTrackerByMap />
        </TabPanel>
        <TabPanel>
          <CompareSchedule />
        </TabPanel>
        <TabPanel>
          <MovementTable />
        </TabPanel>
      </Tabs>
    </div>
  );
}
