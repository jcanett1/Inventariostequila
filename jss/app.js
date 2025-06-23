// Importaciones
import supabase, { testConnection } from './supabaseClient.js'
import UIController from './uiController.js'
import ChartController from './chartController.js'
import 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'

// Configuración
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

// Controlador de Datos
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
      console.error("Error cargando categorías:", error)
      return { "Electrónica": 25, "Ropa": 18 }
    }
  }

  static async getMovements() {
    try {
      const dateLimit = new Date()
      dateLimit.setDate(dateLimit.getDate() - CONFIG.charts.daysToShow)
      const dateString = dateLimit.toISOString().split('T')[0]

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
      ])

      return {
        entries: entries.data || [],
        outputs: outputs.data || []
      }

    } catch (error) {
      console.error("Error cargando movimientos:", error)
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

// Inicialización de la aplicación
class App {
  static async init() {
    try {
      // 1. Verificar conexión
      if (!(await testConnection())) {
        console.error("No se pudo conectar a Supabase")
        return this.showErrorState()
      }

      // 2. Inicializar UI
      await UIController.init()

      // 3. Cargar datos
      const [categoriesData, movementsData] = await Promise.all([
        DataService.getCategories(),
        DataService.getMovements()
      ])

      // 4. Inicializar gráficos
      ChartController.initCategoryChart(categoriesData)
      ChartController.initMovementsChart(movementsData.entries, movementsData.outputs)

    } catch (error) {
      console.error("Error inicializando aplicación:", error)
      this.showErrorState()
    }
  }

  static showErrorState() {
    // Mostrar datos de ejemplo
    ChartController.initCategoryChart({ "Electrónica": 25, "Ropa": 18 })
    ChartController.initMovementsChart(
      [{ date: new Date().toISOString().split('T')[0], quantity: 5 }],
      [{ date: new Date().toISOString().split('T')[0], quantity: 2 }]
    )
  }
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', App.init)
