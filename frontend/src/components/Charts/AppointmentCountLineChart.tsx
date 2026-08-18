import type { ApexOptions } from 'apexcharts';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';

const options: ApexOptions = {
  chart: {
    type: 'area',
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    fontFamily: 'Poppins',
  },
  markers: {
    size: 5,
    shape: 'circle',
    hover: {
      size: 7,
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    title: {
      text: 'Time',
    },
  },
  yaxis: {
    title: {
      text: 'Count',
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100],
    },
  },
  colors: ['#4d53e0'],
};

const AppointmentCountLineChart = ({
  data,
  dataQa,
}: {
  data: any;
  dataQa?: string;
}) => {
  const formattedOptions = useMemo(() => {
    return {
      ...options,
      xaxis: { ...options.xaxis, categories: data.dates },
    };
  }, [data]);

  return (
    <Chart
      options={formattedOptions}
      type='area'
      series={[
        {
          name: 'Appointments count',
          data: data.series,
        },
      ]}
      width='100%'
      height='350'
      {...{ 'data-qa': dataQa }}
    />
  );
};

export default AppointmentCountLineChart;
