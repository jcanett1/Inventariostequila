// jss/uiController.js

import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';
import * as ChartController from './chartController.js';

class UIController {
  static init() {
    console.log("Inicializando sistema...");
    this.loadProductsTable();
    this.loadMovementsTab();
    this.loadSuppliersTable();
    this.updateCategoryChart();
    this.updateMovementsChart(30);
  }

  static loadProductsTable() {
    const tbody = document.getElementById("productosTableBody");
    ProductController.getAll().then(products => {
      tbody.innerHTML = "";
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
    });
  }

  static loadMovementsTab() {
    // Cargar productos y proveedores en selects
    ProductController.getAll().then(products => {
      const productSelect = document.getElementById("productoEntrada");
      productSelect.innerHTML = '<option value="" selected disabled>Selecciona un producto</option>';
      products.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = `${p.nombre} (${p.categoria})`;
        productSelect.appendChild(option);
      });
    });

    SupplierController.getAll().then(suppliers => {
      const supplierSelect = document.getElementById("proveedorEntrada");
      supplierSelect.innerHTML = '<option value="" selected disabled>Selecciona un proveedor</option>';
      suppliers.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = s.nombre;
        supplierSelect.appendChild(option);
      });
    });
  }

  static updateCategoryChart() {
    ProductController.getAll().then(products => {
      const categoryMap = {};
      products.forEach(p => {
        if (!categoryMap[p.categoria]) {
          categoryMap[p.categoria] = 0;
        }
        categoryMap[p.categoria] += p.stock;
      });
      ChartController.updateCategoryChart(categoryMap);
    });
  }

  static updateMovementsChart(days = 30) {
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 86400000);

    MovementController.getEntriesByDate(startDate.toISOString().split('T')[0], today.toISOString().split('T')[0])
      .then(entries => {
        MovementController.getOutputsByDate(startDate.toISOString().split('T')[0], today.toISOString().split('T')[0])
          .then(outputs => {
            ChartController.updateMovementsChart(entries, outputs, days);
          });
      });
  }
}

window.UIController = UIController; // Hacer disponible globalmente (opcional)
export default UIController;
