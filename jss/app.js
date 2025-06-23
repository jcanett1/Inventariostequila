import UIController from './uiController.js';
import ChartController from './chartController.js';
import supabase from './supabaseClient.js';

// Configuración de tablas (ajustado a tu estructura exacta)
const TABLE_NAMES = {
  products: 'productos',
  entries: 'entradas',
  outputs: 'salidas'
};

// Función para cargar datos de categorías
async function fetchCategoriesData() {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.products)
      .select('category, stock')
      .order('stock', { ascending: false });

    if (error) throw error;

    return data.reduce((acc, product) => {
      const category = product.category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + (product.stock || 0);
      return acc;
    }, {});

  } catch (error) {
    console.error("Error loading categories:", {
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return { "Electrónica": 25, "Ropa": 18 }; // Datos de ejemplo
  }
}

// Función para cargar movimientos (ajustada a tus columnas 'date')
async function fetchMovementsData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString().split('T')[0];

    const [{ data: entries }, { data: outputs }] = await Promise.all([
      supabase
        .from(TABLE_NAMES.entries)
        .select('date, quantity')
        .gte('date', dateString)
        .order('date', { ascending: true }),
      supabase
        .from(TABLE_NAMES.outputs)
        .select('date, quantity')
        .gte('date', dateString)
        .order('date', { ascending: true })
    ]);

    return {
      entries: entries || [],
      outputs: outputs || []
    };

  } catch (error) {
    console.error("Error loading movements:", {
      message: error.message,
      code: error.code
    });
    return {
      entries: [{ date: new Date().toISOString().split('T')[0], quantity: 5 }],
      outputs: [{ date: new Date().toISOString().split('T')[0], quantity: 2 }]
    };
  }
}

// Procesar datos de movimientos para el gráfico
function processMovementData(entries, outputs) {
  const allDates = [
    ...new Set([
      ...entries.map(e => e.date),
      ...outputs.map(o => o.date)
    ])
  ].sort();

  return {
    labels: allDates,
    entriesData: allDates.map(date => 
      entries.find(e => e.date === date)?.quantity || 0
    ),
    outputsData: allDates.map(date => 
      outputs.find(o => o.date === date)?.quantity || 0
    )
  };
}

// Inicialización segura de gráficos
function initCharts(categoriesData, movementsData) {
  const categoryCtx = document.getElementById('stockByCategory');
  const movementCtx = document.getElementById('stockMovements');

  // Gráfico de categorías (solo si existe el canvas)
  if (categoryCtx) {
    try {
      new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoriesData),
          datasets: [{
            data: Object.values(categoriesData),
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
      });
    } catch (error) {
      console.error("Error inicializando gráfico de categorías:", error);
    }
  }

  // Gráfico de movimientos (solo si existe el canvas)
  if (movementCtx) {
    try {
      const { labels, entriesData, outputsData } = processMovementData(
        movementsData.entries,
        movementsData.outputs
      );

      new Chart(movementCtx, {
        type: 'line',
        data: {
          labels: labels,
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
      });
    } catch (error) {
      console.error("Error inicializando gráfico de movimientos:", error);
    }
  }
}

// Inicialización principal
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM cargado. Inicializando aplicación...");

  try {
    // 1. Inicializar UI
    UIController.init();

    // 2. Verificar elementos del DOM
    const chartElements = {
      category: document.getElementById('stockByCategory'),
      movement: document.getElementById('stockMovements')
    };

    if (!chartElements.category && !chartElements.movement) {
      console.warn("No se encontraron elementos canvas. Verifica:");
      console.warn("1. Que estás en index.html");
      console.warn("2. Que los IDs coinciden exactamente");
      return;
    }

    // 3. Cargar datos
    const [categoriesData, movementsData] = await Promise.all([
      chartElements.category ? fetchCategoriesData() : Promise.resolve(null),
      chartElements.movement ? fetchMovementsData() : Promise.resolve(null)
    ]);

    // 4. Inicializar gráficos
    initCharts(categoriesData, movementsData);

  } catch (error) {
    console.error("Error en la inicialización:", error);
    // Mostrar datos de ejemplo en caso de error
    initCharts(
      { "Electrónica": 25, "Ropa": 18 },
      {
        entries: [{ date: new Date().toISOString().split('T')[0], quantity: 5 }],
        outputs: [{ date: new Date().toISOString().split('T')[0], quantity: 2 }]
      }
    );
  }
});
