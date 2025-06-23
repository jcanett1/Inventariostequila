import ProductController from './productController.js';
import SupplierController from './supplierController.js';
import MovementController from './movementController.js';
import ChartController from './chartController.js';

class UIController {
  static async init() {
    await this.loadProductsTable();
    await this.loadSuppliersTable();
    await this.loadMovementsTab();
    await this.updateCategoryChart();
    await this.updateMovementsChart(30);
    await this.loadLowStockTable();
  }

  static async loadProductsTable() {
    const tbody = document.getElementById("productosTableBody");
    const products = await ProductController.getAll();
    tbody.innerHTML = "";

    if (!products.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay productos</td></tr>";
      return;
    }

    products.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>$${parseFloat(p.precio).toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary edit-product" data-id="${p.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger delete-product" data-id="${p.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  static async updateCategoryChart() {
    const products = await ProductController.getAll();
    const categoryMap = {};

    products.forEach(p => {
      if (!categoryMap[p.categoria]) categoryMap[p.categoria] = 0;
      categoryMap[p.categoria] += p.stock;
    });

    ChartController.initCategoryChart(categoryMap);
  }

  static async updateMovementsChart(days = 30) {
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 86400000); // días atrás

    const [entries, outputs] = await Promise.all([
      MovementController.getEntriesByDate(startDate.toISOString().split("T")[0], today.toISOString().split("T")[0]),
      MovementController.getOutputsByDate(startDate.toISOString().split("T")[0], today.toISOString().split("T")[0])
    ]);

    ChartController.initMovementsChart(entries, outputs, days);
  }

  static async loadSuppliersTable() {
    // Implementa la carga de la tabla de proveedores si es necesario
  }

  static async loadMovementsTab() {
    // Implementa la carga de la tabla de movimientos si es necesario
  }

  static async loadLowStockTable() {
    // Implementa la carga de la tabla de productos con bajo stock si es necesario
  }
}

export default UIController;
