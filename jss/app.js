import UIController from './uiController.js';
import ChartController from './chartController.js';

async function loadChartData() {
  // Ejemplo con datos estáticos (reemplázalo con tus datos reales de Supabase)
  const categoriesData = { "Electrónica": 50, "Ropa": 30, "Alimentos": 20 };
  
  const movementsData = {
    entries: [
      { date: new Date(2024, 5, 1), quantity: 10 },
      { date: new Date(2024, 5, 2), quantity: 15 }
    ],
    outputs: [
      { date: new Date(2024, 5, 1), quantity: 5 },
      { date: new Date(2024, 5, 2), quantity: 8 }
    ]
  };

  return { categoriesData, movementsData };
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM completamente cargado");
  
  // 1. Inicializar UI
  UIController.init();
  
  // 2. Cargar datos para gráficos
  const { categoriesData, movementsData } = await loadChartData();
  
  // 3. Inicializar gráficos
  ChartController.initCategoryChart(categoriesData);
  ChartController.initMovementsChart(movementsData.entries, movementsData.outputs);
});
