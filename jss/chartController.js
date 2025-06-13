// chartController.js

// js/chartController.js

import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'; 

class ChartController {
  static categoryChart = null;
  static movementsChart = null;

  static initCategoryChart(data) {
    const ctx = document.getElementById('stockByCategory');
    this.categoryChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Stock por Categoría',
          data: Object.values(data),
          backgroundColor: ['#3f51b5', '#f50057', '#4caf50', '#ff9800', '#9c27b0']
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

  static initMovementsChart(days = 30) {
    const ctx = document.getElementById('stockMovements');
    const labels = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - days + i + 1);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });

    this.movementsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Entradas', data: [], borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.2)' },
          { label: 'Salidas', data: [], borderColor: '#f44336', backgroundColor: 'rgba(244, 67, 54, 0.2)' }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Movimientos de Inventario' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  static updateCategoryChart(data) {
    if (this.categoryChart) {
      this.categoryChart.data.labels = Object.keys(data);
      this.categoryChart.data.datasets[0].data = Object.values(data);
      this.categoryChart.update();
    }
  }

  static updateMovementsChart(entries, outputs, days = 30) {
    if (!this.movementsChart) return;

    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - days + i + 1);
      dates.push(d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }));
    }

    const entriesData = Array(days).fill(0);
    const outputsData = Array(days).fill(0);

    entries.forEach(e => {
      const diff = Math.floor((new Date() - new Date(e.date)) / (1000 * 60 * 60 * 24));
      if (diff < days && diff >= 0) {
        entriesData[days - 1 - diff] += e.quantity;
      }
    });

    outputs.forEach(o => {
      const diff = Math.floor((new Date() - new Date(o.date)) / (1000 * 60 * 60 * 24));
      if (diff < days && diff >= 0) {
        outputsData[days - 1 - diff] += o.quantity;
      }
    });

    this.movementsChart.data.labels = dates;
    this.movementsChart.data.datasets[0].data = entriesData;
    this.movementsChart.data.datasets[1].data = outputsData;
    this.movementsChart.update();
  }
}

export default ChartController;
