import ProductController from './productController.js';
import SupplierController from './supplierController.js';
import MovementController from './movementController.js';
import ChartController from './chartController.js';

class UIController {
  static async init() {
    try {
      // Configurar listeners básicos primero
      await this.setupEventListeners();
      
      // Detectar qué módulo estamos usando
      const path = window.location.pathname;
      
      if (path.includes('productos')) {
        await this.loadProductsTable();
        await this.updateCategoryChart();
      }
      else if (path.includes('proveedores')) {
        await this.setupSupplierListeners();
        await this.loadSuppliersTable();
      }
      else if (path.includes('movimientos')) {
        await this.loadMovementsTab();
        await this.updateMovementsChart(30);
      }
      
      // Carga común a todas las páginas
      await this.loadLowStockTable();
      
    } catch (error) {
      console.error("Error en inicialización:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de inicialización',
        text: 'No se pudo iniciar la aplicación correctamente',
        footer: error.message
      });
    }
  }

  static async setupEventListeners() {
    // Formulario de productos
    document.getElementById("productoForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

        const newProduct = {
          name: document.getElementById("nombreProducto").value.trim(),
          description: document.getElementById("descripcionProducto").value.trim(),
          category: document.getElementById("categoriaProducto").value,
          price: parseFloat(document.getElementById("precioProducto").value),
          stock: 0
        };

        if (!newProduct.name || isNaN(newProduct.price) || newProduct.price <= 0) {
          throw new Error('Nombre y precio válido son requeridos');
        }

        await ProductController.add(newProduct);
        await this.loadProductsTable();
        form.reset();
        
        Swal.fire({
          icon: 'success',
          title: 'Producto agregado',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        console.error("Error al agregar producto:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo agregar el producto'
        });
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Producto';
      }
    });

    // Eventos de tabla de productos
    document.getElementById("productosTableBody")?.addEventListener("click", async (e) => {
      const deleteBtn = e.target.closest('.delete-product');
      if (deleteBtn) {
        await this.deleteProduct(deleteBtn.dataset.id);
      }
      
      const editBtn = e.target.closest('.edit-product');
      if (editBtn) {
        await this.editProduct(editBtn.dataset.id);
      }
    });
  }

  static async setupSupplierListeners() {
    const form = document.getElementById("proveedorForm");
    if (!form) return;

    // Eliminar listener previo para evitar duplicados
    form.removeEventListener("submit", this.handleSupplierSubmit);
    form.addEventListener("submit", this.handleSupplierSubmit);
  }

  static handleSupplierSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';

      const newSupplier = {
        name: document.getElementById("nombreProveedor").value.trim(),
        contact: document.getElementById("contactoProveedor").value.trim(),
        email: document.getElementById("emailProveedor").value.trim(),
        phone: document.getElementById("telefonoProveedor").value.trim(),
        credit: parseFloat(document.getElementById("creditoProveedor").value) || 0
      };

      if (!newSupplier.name) {
        throw new Error('El nombre del proveedor es requerido');
      }
      if (newSupplier.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSupplier.email)) {
        throw new Error('El formato del email es inválido');
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
      console.error('Error al agregar proveedor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo agregar el proveedor',
        footer: 'Verifica los datos e intenta nuevamente'
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Proveedor';
    }
  };

  static async loadProductsTable() {
    const tbody = document.getElementById("productosTableBody");
    if (!tbody) return;

    try {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando productos...</p>
          </td>
        </tr>
      `;

      const products = await ProductController.getAll();
      
      if (!products?.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-muted">
              No hay productos registrados
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = products.map(product => `
        <tr>
          <td>${product.name || product.nombre || "Sin nombre"}</td>
          <td>${product.category || product.categoria || "General"}</td>
          <td class="text-end">$${(product.price || product.precio || 0).toFixed(2)}</td>
          <td class="text-center">
            <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
              ${product.stock || 0}
            </span>
          </td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary edit-product" data-id="${product.id}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-outline-danger delete-product" data-id="${product.id}" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join("");

      // Inicializar tooltips
    document.querySelectorAll('[title]').forEach(el => {
    new bootstrap.Tooltip(el);
});

    } catch (error) {
      console.error("Error cargando productos:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-danger">
            <i class="fas fa-exclamation-circle me-2"></i>
            Error al cargar productos: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  static async loadSuppliersTable() {
    const tbody = document.getElementById("proveedoresTableBody");
    if (!tbody) return;

    try {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando proveedores...</p>
          </td>
        </tr>
      `;

      const suppliers = await SupplierController.getAll();
      
      if (!suppliers?.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4 text-muted">
              No hay proveedores registrados
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = suppliers.map(supplier => `
        <tr>
          <td>${supplier.nombre || "Sin nombre"}</td>
          <td>${supplier.contacto || "—"}</td>
          <td>${supplier.correo ? `<a href="mailto:${supplier.correo}">${supplier.correo}</a>` : "—"}</td>
          <td>${supplier.telefono ? `<a href="tel:${supplier.telefono}">${supplier.telefono}</a>` : "—"}</td>
          <td class="text-end">$${(supplier.credito || 0).toFixed(2)}</td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary edit-supplier" data-id="${supplier.id}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-outline-danger delete-supplier" data-id="${supplier.id}" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join("");

      // Inicializar tooltips
      $('[title]').tooltip();

    } catch (error) {
      console.error("Error cargando proveedores:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-danger">
            <i class="fas fa-exclamation-circle me-2"></i>
            Error al cargar proveedores: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  static async deleteProduct(id) {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar producto?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
      });

      if (isConfirmed) {
        await ProductController.delete(id);
        await this.loadProductsTable();
        Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
    }
  }

  static async deleteSupplier(id) {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar proveedor?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar'
      });

      if (isConfirmed) {
        await SupplierController.delete(id);
        await this.loadSuppliersTable();
        Swal.fire('Eliminado!', 'El proveedor ha sido eliminado.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
    }
  }

  static async updateCategoryChart() {
    try {
      const products = await ProductController.getAll();
      const categoryMap = {};

      products.forEach(p => {
        const category = p.category || p.categoria;
        if (!categoryMap[category]) categoryMap[category] = 0;
        categoryMap[category] += p.stock || 0;
      });

      ChartController.initCategoryChart(categoryMap);
    } catch (error) {
      console.error("Error actualizando gráfico de categorías:", error);
    }
  }

  static async updateMovementsChart(days = 30) {
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - days * 86400000);

      const [entries, outputs] = await Promise.all([
        MovementController.getEntriesByDate(startDate.toISOString().split("T")[0], today.toISOString().split("T")[0]),
        MovementController.getOutputsByDate(startDate.toISOString().split("T")[0], today.toISOString().split("T")[0])
      ]);

      ChartController.initMovementsChart(entries, outputs, days);
    } catch (error) {
      console.error("Error actualizando gráfico de movimientos:", error);
    }
  }

  static async loadMovementsTab() {
    // Implementación pendiente
  }

  static async loadLowStockTable() {
    // Implementación pendiente
  }
}

export default UIController;
