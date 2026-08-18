import type { ApexOptions } from 'apexcharts';
import moment from 'moment';
import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';

const options: ApexOptions = {
  chart: {
    height: 350,
    zoom: {
      autoScaleYaxis: true,
    },
    // toolbar: {
    //   show: false,
    // },
    // selection: {
    //   enabled: false,
    // },
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
    size: 0,
    shape: 'circle',
  },
  xaxis: {
    type: 'datetime',
    // min: moment().startOf('day').toDate().getTime(),
    // tickAmount: 6,
  },
  tooltip: {
    x: {
      format: 'HH:mm dd MMM yyyy',
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
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100],
    },
  },
};

const CapacityChart = ({ data, dataQa }: { data: any; dataQa?: string }) => {
  const selectedDate = useSelector(
    (state: any) => state.statistics.selectedDate,
  );

  const formattedOptions = useMemo(() => {
    const colors = data.colors?.length
      ? data.colors
      : ['#4d53e0', '#00831c', '#e64100'];
    return {
      ...options,
      colors,
    };
  }, [data]);

  const formattedSeries = useMemo(() => {
    const responseRows = data.series;
    let series: any = [];
    for (const row of responseRows) {
      let data = [];
      const currentTime = moment(selectedDate).startOf('week').add(1, 'days');
      for (let index = 0; index < row.data.length; index++) {
        const time = currentTime.add(15, 'minutes').toDate().getTime();
        data.push([time, row.data[index]]);
      }
      series.push({
        ...row,
        data,
      });
    }
    return series;
  }, [data, selectedDate]);

  return (
    <Chart
      options={formattedOptions}
      type='area'
      series={formattedSeries}
      width='100%'
      height='400'
      {...{ 'data-qa': dataQa }}
    />
  );
};

export default CapacityChart;
