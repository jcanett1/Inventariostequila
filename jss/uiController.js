// jss/uiController.js

// js/uiController.js

import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';


class UIController {
  static async init() {
    console.log("Inicializando sistema...");
    await this.loadProductsTable();
    await this.loadSuppliersTable();
    await this.loadMovementsTab();
    await this.updateCategoryChart();
    await this.updateMovementsChart(30);
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

  static async loadSuppliersTable() {
    const tbody = document.getElementById("proveedoresTableBody");
    const suppliers = await SupplierController.getAll();
    tbody.innerHTML = "";

    if (!suppliers.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay proveedores</td></tr>";
      return;
    }

    suppliers.forEach(s => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.nombre}</td>
        <td>${s.contacto}</td>
        <td>${s.correo || "-"}</td>
        <td>${s.telefono || "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary edit-supplier" data-id="${s.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger delete-supplier" data-id="${s.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  static async loadMovementsTab() {
    const productSelect = document.getElementById("productoEntrada");
    const supplierSelect = document.getElementById("proveedorEntrada");

    const [products, suppliers] = await Promise.all([
      ProductController.getAll(),
      SupplierController.getAll()
    ]);

    productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    suppliers.forEach(s => {
      const option = document.createElement("option");
      option.value = s.id;
      option.textContent = s.nombre;
      supplierSelect.appendChild(option);
    });

    productSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    products.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.nombre} (${p.categoria})`;
      productSelect.appendChild(option);
    });
  }

  static async updateCategoryChart() {
    const products = await ProductController.getAll();
    const categoryMap = {};

    products.forEach(p => {
      if (!categoryMap[p.categoria]) categoryMap[p.categoria] = 0;
      categoryMap[p.categoria] += p.stock;
    });

    ChartController.updateCategoryChart(categoryMap);
  }

  static async updateMovementsChart(periodDays = 30) {
    const today = new Date();
    const limitDate = new Date();
    limitDate.setDate(today.getDate() - periodDays);

    const [entries, outputs] = await Promise.all([
      MovementController.getEntriesByDate(limitDate.toISOString().split("T")[0], today.toISOString().split("T")[0]),
      MovementController.getOutputsByDate(limitDate.toISOString().split("T")[0], today.toISOString().split("T")[0])
    ]);

    ChartController.updateMovementsChart(entries, outputs, periodDays);
  }
}

export default UIController;
