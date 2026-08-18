import type { ApexOptions } from 'apexcharts';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { colourNameToHex } from 'utils/colorNameToHex';

const options: ApexOptions = {
  chart: {
    type: 'bar',
    stacked: true,
    stackType: '100%',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    fontFamily: 'Poppins',
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0,
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
  xaxis: {
    title: {
      text: 'Time',
    },
  },
  yaxis: {
    title: {
      text: 'Percentage',
    },
  },
  legend: {
    position: 'right',
    offsetY: -20,
  },
  fill: {
    opacity: 1,
  },
};

const ActivityDurationsColumnChart = ({
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
      xaxis: { ...options.xaxis, categories: data.dates },
    };
  }, [data]);

  const series = useMemo(() => window.structuredClone(data.series), [data]);

  return (
    <Chart
      options={formattedOptions}
      type='bar'
      series={series}
      width='100%'
      height='350'
      {...{ 'data-qa': dataQa }}
    />
  );
};

export default ActivityDurationsColumnChart;
