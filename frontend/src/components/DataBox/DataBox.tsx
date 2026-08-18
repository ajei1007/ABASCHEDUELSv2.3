import type { FC } from 'react';
import { Stack } from '@mui/system';
import styles from './DateBox.module.scss';
import { Typography } from '@mui/material';

interface DataBoxProps {
  title: string;
  subtitle: string;
  icon: JSX.Element;
  dataQa?: string; // Optional prop for data-qa attribute
}

const DataBox: FC<DataBoxProps> = ({ title, subtitle, icon, dataQa }) => {
  return (
    <Stack
      className={styles.boxWrapper}
      direction='row'
      alignItems='center'
      flexWrap='wrap'
      data-qa={dataQa} // Apply data-qa attribute if provided
    >
      <Stack className={styles.iconWrapper}>{icon}</Stack>
      <Stack className={styles.textWrapper}>
        <Typography className={styles.title}>{title}</Typography>
        <Typography className={styles.subtitle}>{subtitle}</Typography>
      </Stack>
    </Stack>
  );
};

export default DataBox;
