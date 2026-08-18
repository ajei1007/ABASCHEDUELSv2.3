import type { ApexOptions } from 'apexcharts';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';

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
  stroke: {
    width: 3,
  },
  title: {
    text: '',
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    title: {
      text: 'Date',
    },
  },
  markers: {
    size: 5,
    shape: 'circle',
    hover: {
      size: 7,
    },
  },
  legend: {
    show: true,
    offsetY: 4,
  },
};

const Efficiency = ({
  chartData,
  dataQa,
}: {
  chartData: any;
  dataQa?: string;
}) => {
  const formattedOptions = useMemo(() => {
    return {
      ...options,
      xaxis: { ...options.xaxis, categories: chartData.dates },
      yaxis: chartData.data.flatMap((_: any, index: number) => {
        return [
          {
            seriesName: 'Efficiency',
            tickAmount: 10,
            min: 0,
            max: 100,
            show: index === 0 ? true : false,
            labels: {
              show: false,
              formatter: function (value: any) {
                return value + '%';
              },
            },
          },
          {
            seriesName: 'Productivity',
            tickAmount: 10,
            min: 0,
            max: 100,
            show: index === 0 ? true : false,
            labels: {
              formatter: function (value: any) {
                return value + '%';
              },
            },
            title: {
              text: 'Percentage',
            },
          },
        ];
      }),
      colors: [
        '#00315f',
        '#0282f9',
        '#1a5d00',
        '#3dd700',
        '#630000',
        '#ff2b13',
      ],
    };
  }, [chartData]);

  const series = useMemo(() => {
    const updatedSeries = chartData.data.flatMap((branchData: any) => {
      return [
        {
          name: `${branchData.branchLabel} Productivity`,
          type: 'line',
          data: branchData.series.productivity.data,
        },
        {
          name: `${branchData.branchLabel} Efficiency`,
          type: 'line',
          data: branchData.series.efficiency.data,
        },
      ];
    });
    return updatedSeries;
  }, [chartData]);

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

export default Efficiency;
