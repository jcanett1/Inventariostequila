// js/app.js

import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';
import * as UIController from './uiController.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Cargando productos...");
    const products = ProductController.getAll(); // Síncrono si usas localStorage
    console.log("Productos:", products);

    console.log("Cargando proveedores...");
    const suppliers = SupplierController.getAll();
    console.log("Proveedores:", suppliers);

    console.log("Cargando movimientos...");
    const entries = MovementController.getAllEntries();
    const outputs = MovementController.getAllOutputs();
    console.log("Entradas:", entries);
    console.log("Salidas:", outputs);

    // Renderiza datos iniciales
    UIController.init();
  } catch (e) {
    console.error("Error durante la inicialización:", e.message);
  }
});
