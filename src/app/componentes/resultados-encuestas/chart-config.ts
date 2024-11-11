import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
  
} from 'ng-apexcharts';

// Tipos definidos para los gráficos
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};



export type chartOptionsColumn = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis?: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};

export type ChartOptionsRadial = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
};

// Configuración de los gráficos
export const chartOptions: ChartOptions = {
  series: [44, 55, 13, 43, 22],
  chart: {
    width: 380,
    type: 'pie',
    events: {
      dataPointSelection: (event: any, chartContext: any, config: any) => {
        // Evento de selección de punto de datos
      },
    },
  },
  labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: '100%',
        },
        legend: {
          labels: {
            colors: '#FFFFFF',
            fontSize: '20px',
          },
          markers: {
            padding: '5px',
          },
          position: 'bottom',
        },
      },
    },
  ],
};

export const chartOptionsColumna: chartOptionsColumn = {
  series: [
    {
      name: 'distributed',
      data: [21, 22, 10, 28, 16, 21, 13, 30],
    },
  ],
  chart: {
    height: 300,
    type: 'bar',
    events: {
      dataPointSelection: (event: any, chartContext: any, config: any) => {
        // Evento de selección de punto de datos
      },
    },
  },
  colors: [
    '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8',
  ],
  plotOptions: {
    bar: {
      columnWidth: '45%',
      distributed: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  grid: {
    show: false,
  },
  xaxis: {
    categories: [
      ['John', 'Doe'], ['Joe', 'Smith'], ['Jake', 'Williams'], 'Amber',
      ['Peter', 'Brown'], ['Mary', 'Evans'], ['David', 'Wilson'], ['Lily', 'Roberts'],
    ],
    labels: {
      style: {
        colors: [
          '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8',
        ],
        fontSize: '12px',
      },
    },
  },
};

export const chartOptionsRadial: ChartOptionsRadial = {
  series: [44, 55, 67, 83],
  chart: {
    height: 350,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: {
          fontSize: '22px',
        },
        value: {
          fontSize: '16px',
        },
        total: {
          show: true,
          label: 'Total',
          formatter: () => '249',
        },
      },
    },
  },
  labels: ['Apples', 'Oranges', 'Bananas', 'Berries'],
};
