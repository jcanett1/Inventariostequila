import supabase from './supabaseClient.js'
import UIController from './uiController.js'
import ChartController from './chartController.js'

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
}

// Servicio de Datos
class DataService {
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from(CONFIG.tables.products)
        .select('category, stock')
        .order('stock', { ascending: false })

      if (error) throw error

      return data.reduce((acc, { category = 'Sin categoría', stock = 0 }) => {
        acc[category] = (acc[category] || 0) + stock
        return acc
      }, {})

    } catch (error) {
      console.error("Error loading categories:", error)
      return { "Electrónica": 25, "Ropa": 18 }
    }
  }

  static async getMovements() {
    try {
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - CONFIG.charts.daysToShow)
      const dateString = dateLimit.toISOString().split('T')[0]

      const [entries, outputs] = await Promise.all([
        supabase.from(CONFIG.tables.entries)
          .select('date, quantity')
          .gte('date', dateString)
          .order('date'),
        supabase.from(CONFIG.tables.outputs)
          .select('date, quantity')
          .gte('date', dateString)
          .order('date')
      ])

      return {
        entries: entries.data || [],
        outputs: outputs.data || []
      }

    } catch (error) {
      console.error("Error loading movements:", error)
      return this.getSampleData()
    }
  }

  static getSampleData() {
    const today = new Date().toISOString().split('T')[0]
    return {
      entries: [{ date: today, quantity: 5 }],
      outputs: [{ date: today, quantity: 2 }]
    }
  }
}

// Clase principal de la aplicación
class App {
  static async init() {
    try {
      // 1. Inicializar UI
      await UIController.init()

      // 2. Cargar datos
      const [categoriesData, movementsData] = await Promise.all([
        DataService.getCategories(),
        DataService.getMovements()
      ])

      // 3. Inicializar gráficos
      App.initCharts(categoriesData, movementsData)

    } catch (error) {
      console.error("App initialization failed:", error)
      App.showErrorState()
    }
  }

  static initCharts(categoriesData, movementsData) {
    const categoryCtx = document.getElementById('stockByCategory')
    const movementCtx = document.getElementById('stockMovements')

    if (categoryCtx) {
      ChartController.initCategoryChart(categoriesData)
    }

    if (movementCtx) {
      ChartController.initMovementsChart(movementsData.entries, movementsData.outputs)
    }
  }

  static showErrorState() {
    const sampleData = DataService.getSampleData()
    ChartController.initCategoryChart({ "Electrónica": 25, "Ropa": 18 })
    ChartController.initMovementsChart(sampleData.entries, sampleData.outputs)
  }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', App.init.bind(App))
