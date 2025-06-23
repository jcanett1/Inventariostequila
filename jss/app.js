import UIController from './uiController.js';
import ChartController from './chartController.js';
import supabase from './supabaseClient.js'; // Importa el cliente Supabase

// Función para cargar datos de categorías desde Supabase
async function fetchCategoriesData() {
  const { data, error } = await supabase
    .from('productos') // Cambia 'productos' por tu tabla real
    .select('categoria, cantidad');

  if (error) {
    console.error("Error al cargar categorías:", error);
    return {};
  }

  // Procesar datos: { "Electrónica": 50, "Ropa": 30 }
  return data.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + item.cantidad;
    return acc;
  }, {});
}

// Función para cargar movimientos desde Supabase
async function fetchMovementsData() {
  const { data: entries, error: entriesError } = await supabase
    .from('entradas') // Cambia por tu tabla de entradas
    .select('date, quantity');

  const { data: outputs, error: outputsError } = await supabase
    .from('salidas') // Cambia por tu tabla de salidas
    .select('date, quantity');

  if (entriesError || outputsError) {
    console.error("Error al cargar movimientos:", entriesError || outputsError);
    return { entries: [], outputs: [] };
  }

  return { entries, outputs };
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM cargado. Inicializando...");

  // 1. Inicializar UI
  UIController.init();

  // 2. Cargar datos REALES desde Supabase
  const categoriesData = await fetchCategoriesData();
  const movementsData = await fetchMovementsData();

  console.log("Datos cargados:", { categoriesData, movementsData });

  // 3. Inicializar gráficos (solo si los canvas existen)
  if (document.getElementById("stockByCategory")) {
    ChartController.initCategoryChart(categoriesData);
  } else {
    console.warn("Canvas 'stockByCategory' no encontrado");
  }

  if (document.getElementById("stockMovements")) {
    ChartController.initMovementsChart(movementsData.entries, movementsData.outputs);
  } else {
    console.warn("Canvas 'stockMovements' no encontrado");
  }
});
