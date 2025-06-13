// jss/uiController.js

import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';
import * as ChartController from './chartController.js';


const UIController = {
  async init() {
    console.log("Inicializando sistema...");

    await this.loadProductsTable();
    await this.loadSuppliersTable();
    await this.loadEntriesTable();
    await this.loadOutputsTable();
    await this.updateCategoryChart();
    await this.updateMovementsChart();
  },

  async loadProductsTable() {
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
  },

  async loadSuppliersTable() {
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
        <td>$${parseFloat(s.credito).toFixed(2)}</td>
        <td>${s.materiales || "Sin especificar"}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary edit-supplier" data-id="${s.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger delete-supplier" data-id="${s.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  },

  async loadEntriesTable() {
    const tbody = document.getElementById("entradasTableBody");
    const entries = await MovementController.getAllEntries();
    tbody.innerHTML = "";

    if (!entries.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay entradas</td></tr>";
      return;
    }

    entries.forEach(e => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${e.date}</td>
        <td>${e.productId}</td>
        <td>${e.supplierId}</td>
        <td>${e.quantity}</td>
        <td>${e.notes || "-"}</td>
      `;
      tbody.appendChild(row);
    });
  },

  async loadOutputsTable() {
    const tbody = document.getElementById("salidasTableBody");
    const outputs = await MovementController.getAllOutputs();
    tbody.innerHTML = "";

    if (!outputs.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No hay salidas</td></tr>";
      return;
    }

    outputs.forEach(o => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${o.date}</td>
        <td>${o.productId}</td>
        <td>${o.quantity}</td>
        <td>${o.reason}</td>
        <td>${o.notes || "-"}</td>
      `;
      tbody.appendChild(row);
    });
  },
};
