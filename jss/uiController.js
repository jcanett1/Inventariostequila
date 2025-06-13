// jss/uiController.js

import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';

class UIController {
  static async loadProductsTable() {
    const tbody = document.getElementById("productosTableBody");
    const products = await ProductController.getAll();
    tbody.innerHTML = "";

    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="5">No hay productos</td></tr>`;
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

    // Eventos de editar y eliminar
    document.querySelectorAll(".delete-product").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.dataset.id);
        await ProductController.delete(id);
        this.loadProductsTable();
      });
    });
  }

  static async init() {
    const products = await ProductController.getAll();
    console.log("Productos cargados:", products);

    // Cargar tabla de productos
    this.loadProductsTable();
  }
}

export default UIController;
