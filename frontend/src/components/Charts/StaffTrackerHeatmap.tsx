/* eslint-disable react-hooks/exhaustive-deps */
import type { ApexOptions } from 'apexcharts';
import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';

const StaffTrackerHeatmap = ({ data }: { data: any }) => {
  const [renderedId, setRenderId] = useState(0);

  // Rerender logic
  useEffect(() => {
    const id = Math.random();
    setRenderId(id);
  }, [data]);

  useEffect(() => {
    const labels = document.querySelectorAll('.apexcharts-yaxis-label');
    if (labels?.length && data?.length) {
      labels.forEach((label) => {
        const tspanElement = label.querySelector('tspan');
        const tspanElementInner = tspanElement?.innerHTML?.trim() ?? '';
        const isTspanEmpty = tspanElementInner === '';

        const findData = data.find(
          (data: any) => data?.name === tspanElementInner,
        );

        if (findData) {
          const max_give = findData['max_give'] ?? 0;
          const max_need = findData['max_need'] ?? 0;

          if (!isTspanEmpty) {
            label.innerHTML +=
              max_give > 0
                ? ` <tspan fill='green'>${max_give}</tspan>`
                : ` <tspan>-</tspan>`;
            label.innerHTML +=
              max_need > 0
                ? ` <tspan fill='red'>${max_need}</tspan>`
                : ` <tspan>-</tspan>`;
          }
        }
      });
    }
  }, [data]);

  const formattedOptions: ApexOptions = useMemo(() => {
    const chartOptions: ApexOptions = {
      chart: {
        height: 750,
        width: '100%',
        type: 'heatmap',
        toolbar: {
          show: false,
        },
        selection: {
          enabled: false,
        },
        fontFamily: 'Poppins',
        redrawOnParentResize: false,
        redrawOnWindowResize: false,
      },
      noData: {
        text: 'No data found!',
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 0,
          useFillColorAsStroke: false,
          distributed: false,
          enableShades: false,
          colorScale: {
            ranges: [
              {
                from: -5000,
                to: 0,
                name: '0',
                color: '#000000',
              },
              {
                from: 0.01,
                to: 0.99,
                name: '< 1 Critical',
                color: '#ff0000',
              },
              {
                from: 1.0,
                to: 1.01,
                name: '1.00 Appropriately Staffed',
                color: '#ffffff',
              },
              {
                from: 1.01,
                to: 1.25,
                name: '1.01-1.25',
                color: '#a0f0a0',
              },
              // {
              //   from: 1.21,
              //   to: 1.40,
              //   name: '1.31-1.40 +30-40%',
              //   color: '#2ded2d',
              // },
              {
                from: 1.25,
                to: 50000,
                name: '1.26+',
                color: '#04e404',
              },

              // {
              //   from: -5000,
              //   to: 0,
              //   name: '0',
              //   color: '#000000',
              // },
              // {
              //   from: 0.01,
              //   to: 1,
              //   name: '<= 1 Critical',
              //   color: '#ff0000',
              // },
              // {
              //   from: 1.01,
              //   to: 1.08,
              //   name: '1.01-1.08 Need Help',
              //   color: '#ea9999',
              // },
              // {
              //   from: 1.09,
              //   to: 1.1,
              //   name: '1.09-1.1 Need Help',
              //   color: '#f4cccc',
              // },
              // {
              //   from: 1.1,
              //   to: 1.19,
              //   name: '1.1-1.18 Staffed Appropriately',
              //   color: '#ffffff',
              // },
              // {
              //   from: 1.19,
              //   to: 1.24,
              //   name: '1.19-1.25 Need to Share',
              //   color: '#b6d7a8',
              // },
              // {
              //   from: 1.24,
              //   to: 5000,
              //   name: '>= 1.25 Need to Share',
              //   color: '#57bb8a',
              // },
            ],
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 1,
      },
      yaxis: [
        {
          show: true,
        },
      ],
    };
    if (data?.length) {
      chartOptions.tooltip = {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex }: any) {
          return `<div className="arrow_box">
          <div>
          ${data[seriesIndex]['name']} ${data[seriesIndex]['data'][dataPointIndex]['x']}
          </div>
          <div>
          adjusted ratio: ${series[seriesIndex][dataPointIndex]}
          </div>
          <div>
          actual ratio: ${data[seriesIndex]['data'][dataPointIndex]['actual_ratio']}
          </div>
          <div>
          Employee Count: ${data[seriesIndex]['data'][dataPointIndex]['emp_count']}
          </div>
          <div>
          Client Count: ${data[seriesIndex]['data'][dataPointIndex]['client_count']}
          </div>
          <div>
          Minimum Need: ${data[seriesIndex]['data'][dataPointIndex]['minimum_need']}
          </div>
          <div>
          Minimum Give: ${data[seriesIndex]['data'][dataPointIndex]['minimum_give']}
          </div>
          </div>`;
        },
      };
    }
    return chartOptions;
  }, [data]);

  const series = useMemo(() => window.structuredClone(data), [data]);

  return (
    <Chart
      key={renderedId}
      options={formattedOptions}
      series={series}
      type='heatmap'
      height={750}
    />
  );
};

export default StaffTrackerHeatmap;
