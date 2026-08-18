import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import RethinkTabPanelUsers from './RethinkTabPanelUsers/RethinkTabPanelUsers';
import RethinkTabPanelEvents from './RethinkTabPanelEvents/RethinkTabPanelEvents';

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: ITabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const RethinkModalContent = ({ onCancel }: { onCancel: () => void }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
        >
          <Tab label='Users' {...a11yProps(0)} />
          <Tab label='Events' {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <RethinkTabPanelUsers onCancel={onCancel} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <RethinkTabPanelEvents onCancel={onCancel} />
      </CustomTabPanel>
    </div>
  );
};

export default RethinkModalContent;
