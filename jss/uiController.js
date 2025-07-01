import ProductController from './productController.js';
import SupplierController from './supplierController.js';
import MovementController from './movementController.js';
import ChartController from './chartController.js';

class UIController {
  static async init() {
    await this.setupEventListeners();
    await this.setupSupplierListeners();
    await this.loadProductsTable();
    await this.loadSuppliersTable();
    await this.loadMovementsTab();
    await this.updateCategoryChart();
    await this.updateMovementsChart(30);
    await this.loadLowStockTable();
  }

  static async setupEventListeners() {
    // Formulario de agregar producto
    document.getElementById("productoForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      try {
        const newProduct = {
          name: document.getElementById("nombreProducto").value.trim(),
          description: document.getElementById("descripcionProducto").value.trim(),
          category: document.getElementById("categoriaProducto").value,
          price: parseFloat(document.getElementById("precioProducto").value),
          stock: 0
        };

        if (!newProduct.name || isNaN(newProduct.price)) {
          Swal.fire("Error", "Nombre y precio son requeridos", "error");
          return;
        }

        await ProductController.add(newProduct);
        await this.loadProductsTable();
        e.target.reset();
        Swal.fire("Éxito", "Producto agregado correctamente", "success");
      } catch (error) {
        console.error("Error al agregar producto:", error);
        Swal.fire("Error", "No se pudo agregar el producto", "error");
      }
    });

    // Listeners para botones de editar/eliminar
    document.getElementById("productosTableBody")?.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-product")) {
        const id = e.target.dataset.id;
        await this.deleteProduct(id);
      }
      // Agregar lógica para editar
    });
  }

  static async deleteProduct(id) {
    try {
      await ProductController.delete(id);
      await this.loadProductsTable();
      Swal.fire("Éxito", "Producto eliminado", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  }




  
  static async setupSupplierListeners() {
  const form = document.getElementById("proveedorForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

    try {
      const newSupplier = {
        name: document.getElementById("nombreProveedor").value.trim(),
        contact: document.getElementById("contactoProveedor").value.trim(),
        email: document.getElementById("emailProveedor").value.trim(),
        phone: document.getElementById("telefonoProveedor").value.trim(),
        credit: parseFloat(document.getElementById("creditoProveedor").value) || 0
      };

      // Validación básica
      if (!newSupplier.name) {
        throw new Error('El nombre del proveedor es requerido');
      }

      const result = await SupplierController.add(newSupplier);
      console.log('Proveedor agregado:', result);
      
      form.reset();
      await this.loadSuppliersTable();
      
      Swal.fire({
        icon: 'success',
        title: 'Proveedor agregado',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo agregar el proveedor'
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Proveedor';
    }
  });
}




  static async loadProductsTable() {
  const tbody = document.getElementById("productosTableBody");
  const products = await ProductController.getAll();
  tbody.innerHTML = "";

  if (!products?.length) {
    tbody.innerHTML = "<tr><td colspan='5'>No hay productos</td></tr>";
    return;
  }

  products.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name || p.nombre || "Sin nombre"}</td>
      <td>${p.category || p.categoria || "General"}</td>
      <td>$${(p.price || p.precio || 0).toFixed(2)}</td>
      <td>${p.stock || 0}</td>
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
    const category = p.category || p.categoria; // Usa el campo correcto
    if (!categoryMap[category]) categoryMap[category] = 0;
    categoryMap[category] += p.stock;
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
  try {
    const tbody = document.getElementById("proveedoresTableBody");
    if (!tbody) return;

    // Mostrar estado de carga
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          Cargando proveedores...
        </td>
      </tr>
    `;

    const suppliers = await SupplierController.getAll();
    
    if (!suppliers || !suppliers.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">
            No hay proveedores registrados
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = suppliers.map(supplier => `
      <tr>
        <td>${supplier.nombre || "Sin nombre"}</td>
        <td>${supplier.contacto || "Sin contacto"}</td>
        <td>${supplier.correo || "Sin email"}</td>
        <td>${supplier.telefono || "Sin teléfono"}</td>
        <td>$${(supplier.credito || 0).toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-warning edit-supplier" data-id="${supplier.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-supplier" data-id="${supplier.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Error cargando proveedores:", error);
    const tbody = document.getElementById("proveedoresTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <i class="fas fa-exclamation-triangle"></i> Error cargando proveedores
          </td>
        </tr>
      `;
    }
  }
}

  static async loadMovementsTab() {
    // Implementa la carga de la tabla de movimientos si es necesario
  }

  static async loadLowStockTable() {
    // Implementa la carga de la tabla de productos con bajo stock si es necesario
  }
}

export default UIController;
