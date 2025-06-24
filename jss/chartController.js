import { Chart } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm'; 

class ChartController {
  static categoryChart = null
  static movementsChart = null

  static initCategoryChart(data) {
    const ctx = document.getElementById('stockByCategory')
    if (!ctx) return

    // Destruir gráfico anterior si existe
    if (this.categoryChart) {
      this.categoryChart.destroy()
    }

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    })
  }

  static initMovementsChart(entries, outputs) {
    const ctx = document.getElementById('stockMovements')
    if (!ctx) return

    // Procesar datos
    const dates = [...new Set([
      ...entries.map(e => e.date),
      ...outputs.map(o => o.date)
    ])].sort()

    const entriesData = dates.map(date => 
      entries.find(e => e.date === date)?.quantity || 0
    )
    const outputsData = dates.map(date => 
      outputs.find(o => o.date === date)?.quantity || 0
    )

    // Destruir gráfico anterior si existe
    if (this.movementsChart) {
      this.movementsChart.destroy()
    }

    this.movementsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Entradas',
            data: entriesData,
            borderColor: '#4BC0C0',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1,
            fill: true
          },
          {
            label: 'Salidas',
            data: outputsData,
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}

export default ChartController
