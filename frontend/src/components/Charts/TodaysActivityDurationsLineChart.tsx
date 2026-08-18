import type { ApexOptions } from 'apexcharts';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { colourNameToHex } from 'utils/colorNameToHex';

const options: ApexOptions = {
  chart: {
    height: 350,
    toolbar: {
      show: false,
    },
    selection: {
      enabled: false,
    },
    zoom: {
      enabled: false,
    },
    fontFamily: 'Poppins',
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      opacity: 0.5,
    },
  },
  markers: {
    size: 5,
    shape: 'circle',
    hover: {
      size: 7,
    },
  },
  xaxis: {
    title: {
      text: 'Time',
    },
  },
  yaxis: {
    title: {
      text: 'Hours',
    },
  },
  legend: {
    show: true,
    offsetY: 4,
  },
};

const TodaysActivityDurationsLineChart = ({
  data,
  dataQa,
}: {
  data: any;
  dataQa?: string;
}) => {
  const formattedOptions = useMemo(() => {
    return {
      ...options,
      colors: data.colors.map((color: string) => colourNameToHex(color)),
      xaxis: { ...options.xaxis, categories: data.times },
    };
  }, [data]);

  const series = useMemo(() => window.structuredClone(data.series), [data]);

  return (
    <Chart
      options={formattedOptions}
      type='line'
      series={series}
      width='100%'
      height='400'
      {...{ 'data-qa': dataQa }}
    />
  );
};

export default TodaysActivityDurationsLineChart;
