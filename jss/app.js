import UIController from './uiController.js';
import Chart from 'chart.js/auto';
import { supabase, testConnection } from './supabaseClient.js';

// Configuración centralizada
const CONFIG = {
  tables: {
    products: 'productos',
    entries: 'entradas',
    outputs: 'salidas'
  },
  charts: {
    colors: {
      category: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      entries: '#4BC0C0',
      outputs: '#FF6384'
    },
    daysToShow: 30
  }
};

// Controlador de Datos
class DataService {
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from(CONFIG.tables.products)
        .select('category, stock')
        .order('stock', { ascending: false });

      if (error) throw error;

      return data.reduce((acc, { category = 'Sin categoría', stock = 0 }) => {
        acc[category] = (acc[category] || 0) + stock;
        return acc;
      }, {});

    } catch (error) {
      console.error("Error loading categories:", error);
      return { "Electrónica": 25, "Ropa": 18 };
    }
  }

  static async getMovements() {
    try {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - CONFIG.charts.daysToShow);
      const dateString = dateLimit.toISOString().split('T')[0];

      const [entries, outputs] = await Promise.all([
        supabase
          .from(CONFIG.tables.entries)
          .select('date, quantity')
          .gte('date', dateString)
          .order('date'),
        supabase
          .from(CONFIG.tables.outputs)
          .select('date, quantity')
          .gte('date', dateString)
          .order('date')
      ]);

      return {
        entries: entries.data || [],
        outputs: outputs.data || []
      };

    } catch (error) {
      console.error("Error loading movements:", error);
      return this.getSampleData();
    }
  }

  static getSampleData() {
    const today = new Date().toISOString().split('T')[0];
    return {
      entries: [{ date: today, quantity: 5 }],
      outputs: [{ date: today, quantity: 2 }]
    };
  }
}

// Controlador de Gráficos
class ChartService {
  static initCategoryChart(ctx, data) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: CONFIG.charts.colors.category,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  static initMovementChart(ctx, entries, outputs) {
    const dates = [...new Set([...entries.map(e => e.date), ...outputs.map(o => o.date)])].sort();
    
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Entradas',
            data: dates.map(date => entries.find(e => e.date === date)?.quantity || 0),
            borderColor: CONFIG.charts.colors.entries,
            backgroundColor: `${CONFIG.charts.colors.entries}20`,
            tension: 0.1,
            fill: true
          },
          {
            label: 'Salidas',
            data: dates.map(date => outputs.find(o => o.date === date)?.quantity || 0),
            borderColor: CONFIG.charts.colors.outputs,
            backgroundColor: `${CONFIG.charts.colors.outputs}20`,
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

// Inicialización de la Aplicación
class App {
  static async init() {
    try {
      // 1. Inicializar UI
      UIController.init();
      
      // 2. Verificar conexión y elementos
      if (!(await this.checkPrerequisites())) return;

      // 3. Cargar datos
      const [categoriesData, movementsData] = await Promise.all([
        DataService.getCategories(),
        DataService.getMovements()
      ]);

      // 4. Renderizar gráficos
      this.renderCharts(categoriesData, movementsData);

    } catch (error) {
      console.error("App initialization failed:", error);
      this.showErrorState();
    }
  }

  static async checkPrerequisites() {
    const elements = {
      category: document.getElementById('stockByCategory'),
      movement: document.getElementById('stockMovements') // Nota: Verifica este ID (¿typo?)
    };

    if (!elements.category && !elements.movement) {
      console.warn("No se encontraron elementos canvas");
      return false;
    }

    if (!(await testConnection())) {
      console.warn("No se pudo conectar a Supabase");
      return false;
    }

    return true;
  }

  static renderCharts(categoriesData, movementsData) {
    const categoryCtx = document.getElementById('stockByCategory');
    const movementCtx = document.getElementById('stockMovements');

    if (categoryCtx) {
      ChartService.initCategoryChart(categoryCtx, categoriesData);
    }

    if (movementCtx) {
      ChartService.initMovementChart(
        movementCtx,
        movementsData.entries,
        movementsData.outputs
      );
    }
  }

  static showErrorState() {
    // Implementar lógica para mostrar estado de error en la UI
    console.log("Mostrando datos de ejemplo debido a error");
    const sampleData = DataService.getSampleData();
    this.renderCharts(
      { "Electrónica": 25, "Ropa": 18 },
      sampleData
    );
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', App.init);
