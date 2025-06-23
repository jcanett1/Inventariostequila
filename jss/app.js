import UIController from './uiController.js';
import ChartController from './chartController.js';
import supabase from './supabaseClient.js';

// Configuración de nombres de tablas (ajusta según tu BD)
const TABLE_NAMES = {
  products: 'productos',
  entries: 'entradas',
  outputs: 'salidas'
};

// Función mejorada para cargar datos de categorías
async function fetchCategoriesData() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('category, stock')
      .order('stock', { ascending: false });

    if (error) throw error;

    // Procesamos para sumar stock por categoría
    return data.reduce((acc, product) => {
      const category = product.category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + (product.stock || 0);
      return acc;
    }, {});

  } catch (error) {
    console.error("Error loading categories:", error);
    return { "Electrónica": 50, "Ropa": 30 }; // Datos de ejemplo
  }
}
// Función mejorada para cargar movimientos
async function fetchMovementsData() {
  try {
    // Últimos 30 días
    const date = new Date();
    date.setDate(date.getDate() - 30);
    
    const { data: entries } = await supabase
      .from('entradas')
      .select('created_at, quantity, product_id')
      .gte('created_at', date.toISOString());

    const { data: outputs } = await supabase
      .from('salidas')
      .select('created_at, quantity, product_id')
      .gte('created_at', date.toISOString());

    return {
      entries: entries || [],
      outputs: outputs || []
    };

  } catch (error) {
    console.error("Error loading movements:", error);
    return {
      entries: [{ created_at: new Date(), quantity: 5 }],
      outputs: [{ created_at: new Date(), quantity: 2 }]
    };
  }
}

// Función para inicializar gráficos de forma segura
function initCharts(categoriesData, movementsData) {
  const categoryCanvas = document.getElementById("stockByCategory");
  const movementCanvas = document.getElementById("stockMovements");

  if (categoryCanvas) {
    try {
      ChartController.initCategoryChart(categoriesData);
    } catch (chartError) {
      console.error("Error inicializando gráfico de categorías:", chartError);
    }
  }

  if (movementCanvas) {
    try {
      ChartController.initMovementsChart(
        movementsData.entries,
        movementsData.outputs
      );
    } catch (chartError) {
      console.error("Error inicializando gráfico de movimientos:", chartError);
    }
  }
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Aplicación iniciando...");

  try {
    UIController.init();
    
    const [categoriesData, movementsData] = await Promise.all([
      fetchCategoriesData(),
      fetchMovementsData()
    ]);

    console.log("Datos cargados:", {
      categories: Object.keys(categoriesData),
      movements: movementsData
    });

    initCharts(categoriesData, movementsData);

  } catch (mainError) {
    console.error("Error en la inicialización:", mainError);
    // Mostrar mensaje de error al usuario
    UIController.showError("Ocurrió un error al cargar los datos");
  }
});
