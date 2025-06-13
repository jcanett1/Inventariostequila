// chartController.js

// chartController.js

class ChartController {
  static initCategoryChart(data) {
    const ctx = document.getElementById('stockByCategory');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Stock por Categoría',
          data: Object.values(data),
          backgroundColor: [
            '#3f51b5', '#f50057', '#4caf50', '#ff9800', '#9c27b0'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Distribución por Categoría' }
        }
      }
    });
  }

  static updateMovementsChart(entries, outputs, days = 30) {
    const ctx = document.getElementById('stockMovements');

    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - days + i + 1);
      dates.push(`${d.getMonth()+1}/${d.getDate()}`);
    }

    const entryData = Array(days).fill(0);
    const outputData = Array(days).fill(0);

    entries.forEach(e => {
      const diff = Math.floor((new Date() - new Date(e.date)) / (1000 * 60 * 60 * 24));
      if (diff < days && diff >= 0) {
        entryData[days - 1 - diff] += e.quantity;
      }
    });

    outputs.forEach(o => {
      const diff = Math.floor((new Date() - new Date(o.date)) / (1000 * 60 * 60 * 24));
      if (diff < days && diff >= 0) {
        outputData[days - 1 - diff] += o.quantity;
      }
    });

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Entradas',
            data: entryData,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)'
          },
          {
            label: 'Salidas',
            data: outputData,
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)'
          }
        ]
      },
      options: {
        responsive: true
      }
    });
  }
}

window.ChartController = ChartController;
