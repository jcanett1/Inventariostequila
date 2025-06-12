// Función principal de inicialización de datos
function initializeData() {
  if (!StorageController.getProducts().length) {
    const sampleProducts = [
      { id: 1, name: "Laptop HP", description: "8GB RAM, 256GB SSD", category: "Electrónicos", price: 599.99, stock: 15 },
      { id: 2, name: "Smartphone Samsung", description: "128GB Almacenamiento", category: "Electrónicos", price: 349.99, stock: 30 },
      { id: 3, name: "Arroz Premium", description: "Paquete 5kg", category: "Alimentos", price: 12.50, stock: 100 },
      { id: 4, name: "Camiseta Algodón", description: "Varios colores", category: "Ropa", price: 15.99, stock: 45 },
      { id: 5, name: "Silla Ergonómica", description: "Soporte lumbar", category: "Hogar", price: 129.99, stock: 8 }
    ];
    StorageController.setProducts(sampleProducts);
  }

  if (!StorageController.getSuppliers().length) {
    const sampleSuppliers = [
      { id: 1, name: "Tecnología Avanzada SA", contact: "Juan Pérez", email: "juan@tecnoavanzada.com", phone: "555-1234", credit: 10000, materials: "Electrónicos" },
      { id: 2, name: "Distribuidora Alimenticia", contact: "María Gómez", email: "maria@distaliment.com", phone: "555-5678", credit: 5000, materials: "Alimentos" },
      { id: 3, name: "Textiles Modernos", contact: "Carlos Ruiz", email: "carlos@textilmod.com", phone: "555-9012", credit: 3000, materials: "Ropa" }
    ];
    StorageController.setSuppliers(sampleSuppliers);
  }

  if (!StorageController.getEntries().length) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const sampleEntries = [
      { id: 1, productId: 1, supplierId: 1, quantity: 5, date: today, notes: "Reposición regular" },
      { id: 2, productId: 3, supplierId: 2, quantity: 20, date: yesterday, notes: "Pedido mensual" }
    ];
    StorageController.setEntries(sampleEntries);
  }

  if (!StorageController.getOutputs().length) {
    const today = new Date().toISOString().split("T")[0];
    const sampleOutputs = [
      { id: 1, productId: 1, quantity: 2, date: today, reason: "Venta", notes: "Cliente XYZ" }
    ];
    StorageController.setOutputs(sampleOutputs);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeData(); // Inicializar datos de ejemplo si no hay ninguno
});
