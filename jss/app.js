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
    // Primero verifiquemos la estructura de la tabla
    const { data: sampleData } = await supabase
      .from('productos')
      .select('*')
      .limit(1)
      .single();

    console.log("Estructura de productos:", sampleData);

    // Luego ajusta los nombres de las columnas según lo que muestre el console.log
    const { data, error } = await supabase
      .from('productos')
      .select('category, stock') // Cambiado a los nombres correctos
      .order('category', { ascending: true });

    if (error) throw error;

    return data.reduce((acc, item) => {
      const key = item.category || 'Sin categoría';
      acc[key] = (acc[key] || 0) + (item.stock || 0); // Cambiado a item.stock
      return acc;
    }, {});

  } catch (error) {
    console.error("Error cargando categorías:", error);
    return {"Electrónica": 15, "Ropa": 8}; // Datos de ejemplo
  }
}
// Función mejorada para cargar movimientos
async function fetchMovementsData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [{ data: entries }, { data: outputs }] = await Promise.all([
      supabase
        .from(TABLE_NAMES.entries)
        .select('created_at, quantity')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      supabase
        .from(TABLE_NAMES.outputs)
        .select('created_at, quantity')
        .gte('created_at', thirtyDaysAgo.toISOString())
    ]);

    return {
      entries: entries || [],
      outputs: outputs || []
    };

  } catch (error) {
    console.error("Error cargando movimientos:", error);
    return {
      entries: [
        { created_at: new Date(), quantity: 5 },
        { created_at: new Date(Date.now() - 86400000), quantity: 3 }
      ],
      outputs: [
        { created_at: new Date(), quantity: 2 },
        { created_at: new Date(Date.now() - 86400000), quantity: 1 }
      ]
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
