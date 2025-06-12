// Función principal de inicialización de datos
import * as ProductController from './productController.js';
import * as SupplierController from './supplierController.js';
import * as MovementController from './movementController.js';

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Cargando datos...");

  // Cargar productos
  const products = await ProductController.getAll();
  console.log("Productos cargados:", products);

  // Cargar proveedores
  const suppliers = await SupplierController.getAll();
  console.log("Proveedores cargados:", suppliers);

  // Cargar movimientos
  const entries = await MovementController.getAllEntries();
  const outputs = await MovementController.getAllOutputs();
  console.log("Entradas:", entries);
  console.log("Salidas:", outputs);
