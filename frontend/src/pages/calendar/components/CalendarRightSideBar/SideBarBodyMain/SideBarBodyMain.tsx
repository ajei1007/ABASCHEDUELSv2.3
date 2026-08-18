import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  memo,
  type FC,
} from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useAppSelector } from 'store/hooks';
import hasUserPermissionOnLockedScheduler from '../../../utils/hasUserPermissionOnLockedScheduler';
import role_permissions from 'helpers/role_permissions';
import MainTabActivities from './MainTabActivities/MainTabActivities';
import MainTabDragEvents from './MainTabDragEvents/MainTabDragEvents';
import { useCalendarViewContext } from '../../../context/CalendarViewContext';

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ overflowY: 'scroll', minHeight: '400px' }}
      {...other}
    >
      {value === index && <Box sx={{ padding: '1rem' }}>{children}</Box>}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const SideBarBodyMain: FC = () => {
  const schedulerLocked = useAppSelector(
    (state) => state.settings.schedulerLocked,
  );
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const { activeDay, activeView } = useCalendarViewContext();

  const [activeTab, setActiveTab] = useState(0);

  const showDragEventsTab = useMemo(
    () =>
      hasUserPermissionOnLockedScheduler(currentUser, schedulerLocked) &&
      role_permissions(currentUser, 'createEvent'),
    [currentUser, schedulerLocked],
  );

  const handleChangeTab = useCallback((_: any, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  useEffect(() => {
    handleChangeTab(null, 0);
  }, [activeView, activeDay, handleChangeTab]);

  return (
    <>
      {/* New */}
      <Tabs
        value={activeTab}
        onChange={handleChangeTab}
        aria-label='basic tabs example'
      >
        <Tab
          label='Activity'
          {...a11yProps(0)}
          data-qa='sidebar-activity-tab'
        />
        {showDragEventsTab && (
          <Tab
            label='Drag Events'
            {...a11yProps(1)}
            data-qa='sidebar-drag-tab'
          />
        )}
      </Tabs>
      <TabPanel value={activeTab} index={0}>
        <MainTabActivities activeDay={activeDay} activeView={activeView} />
      </TabPanel>
      {showDragEventsTab && (
        <TabPanel value={activeTab} index={1}>
          <MainTabDragEvents />
        </TabPanel>
      )}
    </>
  );
};

SideBarBodyMain.displayName = 'SideBarBodyMain';

export default memo(SideBarBodyMain);
