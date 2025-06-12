// js/chartController.js

import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'; 

class ChartController {
  static initCategoryChart(data) {
    new Chart(document.getElementById('stockByCategory'), {
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

  static initMovementsChart(entries, outputs) {
    const ctx = document.getElementById('stockMovements');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3'],
        datasets: [
          {
            label: 'Entradas',
            data: entries.map(e => e.quantity),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)'
          },
          {
            label: 'Salidas',
            data: outputs.map(o => o.quantity),
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

export default ChartController;
