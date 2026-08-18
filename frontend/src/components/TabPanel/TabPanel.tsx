import React from 'react';
import { Box } from '@mui/material';

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      // style={{
      //   overflow: 'hidden',
      // }}
      {...other}
    >
      {value === index && <Box {...other}>{children}</Box>}
    </div>
  );
};

export default TabPanel;
