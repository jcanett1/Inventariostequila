// Función principal de inicialización de datos
import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("Cargando productos...");
  try {
    const products = ProductController.getAll(); // Aquí es donde ocurre el error
    console.log("Productos:", products);
  } catch (e) {
    console.error("Error al obtener productos:", e.message);
  }

  // Cargar proveedores
  const suppliers = await SupplierController.getAll();
  console.log("Proveedores cargados:", suppliers);

  // Cargar movimientos
  const entries = await MovementController.getAllEntries();
  const outputs = await MovementController.getAllOutputs();
  console.log("Entradas:", entries);
  console.log("Salidas:", outputs);

});
