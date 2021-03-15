import range from '../functions/range.js';
import getChanceIsKnown from '../functions/getChanceIsKnown.js';

export default class ResultChart extends Chart {
  constructor(ctx, charListLength, charsKnown) {
    const sampleFreqValues = range(0, charListLength, 100);
    const chances = sampleFreqValues.map(freq => getChanceIsKnown(charsKnown, freq));
    const chancePoints = chances.map((chance, index) => ({ x: sampleFreqValues[index], y: chance }));
    const chancePointsFiltered = chancePoints.filter(point => point.y > 0.001);
    const calculatedScore = chancePointsFiltered.reduce((acc, point) => (acc += point.y), 0);
    // const chancePointsFiltered = chancePoints.filter(point => point.y > 0.001 && point.y < 0.999);
    // const labels = [...chancePointsFiltered.map(point => point.x)];

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
