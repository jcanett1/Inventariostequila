import UIController from './uiController.js';
import ChartController from './chartController.js';

// Ejemplo de datos para el gráfico de categorías
const categoryData = {
  'Electrónica': 100,
  'Ropa': 200,
  'Alimentos': 150,
  'Juguetes': 50,
  'Libros': 75
};

// Ejemplo de datos para el gráfico de movimientos
const entries = [
  { date: '2023-10-01', quantity: 10 },
  { date: '2023-10-02', quantity: 20 },
  { date: '2023-10-03', quantity: 15 }
];

const outputs = [
  { date: '2023-10-01', quantity: 5 },
  { date: '2023-10-02', quantity: 10 },
  { date: '2023-10-03', quantity: 8 }
];

document.addEventListener('DOMContentLoaded', () => {
  UIController.init(); // Inicializa toda la interfaz
  ChartController.initCategoryChart(categoryData);
  ChartController.initMovementsChart(entries, outputs);
});
