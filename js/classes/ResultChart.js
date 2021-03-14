export default class ResultChart extends Chart {
  constructor(ctx, chancePointsFiltered, charsKnown) {
    super(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Chance is known curve',
            data: chancePointsFiltered,
            pointRadius: 0,
            // showLine: false,
            // fill: true,
            backgroundColor: 'rgba(170,56,30,0.2)',
            borderColor: 'rgba(170,56,30,0.2)',
          },
          {
            label: 'Estimated number of characters known',
            data: [
              {
                x: charsKnown,
                y: 0.5,
              },
            ],
            pointBorderColor: 'rgb(170,56,30)',
            pointBackgroundColor: 'rgb(170,56,30)',
          },
        ],
      },
      options: {
        showLines: true,
        title: {
          display: true,
          text: 'Estimated chances of character being known vs frequency rank',
        },
        legend: { display: false },
        tooltips: { enabled: false },
        hover: { mode: null },
        scales: {
          xAxes: [
            {
              type: 'linear',
              position: 'bottom',
              scaleLabel: {
                display: true,
                labelString: 'Character frequency rank',
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                callback: function (value) {
                  return (value * 100).toFixed(0) + '%'; // convert to percentage
                },
              },
              scaleLabel: {
                display: true,
                labelString: 'Chance character is known',
              },
            },
          ],
        },
      },
    });
  }
}
