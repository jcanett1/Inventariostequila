class ChartController {
  static init() {
    this.initCategoryChart();
    this.initMovementsChart();
  }

  static initCategoryChart() {
    const ctx = document.getElementById('stockByCategory');
    if (!ctx) return;

    this.categoryChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          label: 'Inventario por Categoría',
          data: [],
          backgroundColor: [
            'rgba(63, 81, 181, 0.7)',   // primary-color
            'rgba(244, 67, 54, 0.7)',   // error-color
            'rgba(76, 175, 80, 0.7)',   // success-color
            'rgba(255, 152, 0, 0.7)',   // warning-color
            'rgba(96, 130, 182, 0.7)'   // secondary variant
          ],
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'Distribución del Inventario por Categoría'
          }
        }
      }
    });
  }

  static updateCategoryChart(products) {
    if (!this.categoryChart) return;

    const categoryMap = {};

    products.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = 0;
      }
      categoryMap[product.category] += product.stock;
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    this.categoryChart.data.labels = labels;
    this.categoryChart.data.datasets[0].data = data;
    this.categoryChart.update();
  }

  static initMovementsChart() {
    const ctx = document.getElementById('stockMovements');
    if (!ctx) return;

    this.movementsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Entradas',
            data: [],
            borderColor: 'rgba(76, 175, 80, 0.8)',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 3
          },
          {
            label: 'Salidas',
            data: [],
            borderColor: 'rgba(244, 67, 54, 0.8)',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            tension: 0.4,
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Cantidad'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Movimientos de Inventario (Últimos 30 días)'
          }
        }
      }
    });
  }

  static updateMovementsChart(entries, outputs, periodDays = 30) {
    if (!this.movementsChart) return;

    const today = new Date();
    const labels = [];
    const entriesData = Array(periodDays).fill(0);
    const outputsData = Array(periodDays).fill(0);

    // Generate date labels
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      labels.push(this.formatShortDate(date));
    }

    // Populate entry data
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      if (diffDays < periodDays) {
        entriesData[periodDays - 1 - diffDays] += entry.quantity;
      }
    });

    // Populate output data
    outputs.forEach(output => {
      const outputDate = new Date(output.date);
      const diffDays = Math.floor((today - outputDate) / (1000 * 60 * 60 * 24));
      if (diffDays < periodDays) {
        outputsData[periodDays - 1 - diffDays] += output.quantity;
      }
    });

    this.movementsChart.data.labels = labels;
    this.movementsChart.data.datasets[0].data = entriesData;
    this.movementsChart.data.datasets[1].data = outputsData;
    this.movementsChart.update();
  }

  static formatShortDate(date) {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }

  static bindPeriodSelector(selectorId, callback) {
    const selector = document.getElementById(selectorId);
    if (!selector) return;

    selector.addEventListener('change', function () {
      callback(parseInt(this.value));
    });
  }
}
