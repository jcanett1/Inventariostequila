// uiController.js

import ProductController from './productController.js';
import SupplierController from './supplierController.js';
import MovementController from './movementController.js';
import ChartController from './chartController.js';


class UIController {
  static async init() {
    try {
      await this.setupEventListeners();
      const path = window.location.pathname;

      if (path.includes('productos')) {
        await this.loadProductsTable();
        await this.updateCategoryChart();
      } else if (path.includes('proveedores')) {
        await this.setupSupplierListeners();
        await this.loadSuppliersTable();
      } else if (path.includes('movimientos')) {
        await this.loadMovementsTab();
        await this.updateMovementsChart(30);
        await this.loadProductOptions('productoEntrada');
        await this.loadProductOptions('productoSalida');
        await this.loadSupplierOptions('proveedorEntrada');
        this.setupEntryFormListener();
        this.setupOutputFormListener();
      }

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
        credit: parseFloat(document.getElementById("creditoProveedor").value) || 0,
        materials: ''
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
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando productos...</p>
          </td>
        </tr>
      `;

      const products = await ProductController.getAll();

      if (!products?.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-muted">No hay productos registrados</td>
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

      document.querySelectorAll('[title]').forEach(el => new bootstrap.Tooltip(el));

    } catch (error) {
      console.error("Error cargando productos:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-danger">
            <i class="fas fa-exclamation-circle me-2"></i>Error al cargar productos: ${error.message}
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
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando proveedores...</p>
          </td>
        </tr>
      `;

      const suppliers = await SupplierController.getAll();

      if (!suppliers?.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4 text-muted">No hay proveedores registrados</td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = suppliers.map(supplier => `
        <tr>
          <td>${supplier.name || "Sin nombre"}</td>
          <td>${supplier.contact || "—"}</td>
          <td>${supplier.email ? `<a href="mailto:${supplier.email}">${supplier.email}</a>` : "—"}</td>
          <td>${supplier.phone ? `<a href="tel:${supplier.phone}">${supplier.phone}</a>` : "—"}</td>
          <td class="text-end">$${(supplier.credit || 0).toFixed(2)}</td>
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

      document.querySelectorAll('[title]').forEach(el => new bootstrap.Tooltip(el));

    } catch (error) {
      console.error("Error cargando proveedores:", error);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-danger">
            <i class="fas fa-exclamation-circle me-2"></i>Error al cargar proveedores: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  static async loadProductOptions(selectId = 'productoEntrada') {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
      const products = await ProductController.getAll();

      select.innerHTML = '<option value="">Selecciona un producto</option>';

      products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name || 'Sin nombre';
        select.appendChild(option);
      });

    } catch (error) {
      console.error("Error cargando productos:", error);
      select.innerHTML = '<option value="">Error al cargar productos</option>';
    }
  }

  static async loadSupplierOptions(selectId = 'proveedorEntrada') {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
      const suppliers = await SupplierController.getAll();

      select.innerHTML = '<option value="">Selecciona un proveedor</option>';

      suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name || 'Sin nombre';
        select.appendChild(option);
      });

    } catch (error) {
      console.error("Error cargando proveedores:", error);
      select.innerHTML = '<option value="">Error al cargar proveedores</option>';
    }
  }

  static async setupEntryFormListener() {
    const form = document.getElementById('entradaForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const productId = document.getElementById('productoEntrada').value;
      const supplierId = document.getElementById('proveedorEntrada').value;
      const quantity = document.getElementById('cantidadEntrada').value;
      const date = document.getElementById('fechaEntrada').value;
      const notes = document.getElementById('notasEntrada').value;

      if (!productId || !supplierId || !quantity || !date) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
      }

      try {
        await MovementController.addEntry({
          productId,
          supplierId,
          quantity,
          date,
          notes
        });

        Swal.fire('Éxito', 'Entrada registrada correctamente', 'success');
        form.reset();
        await this.loadMovementsTab(); // Recargar pestaña de movimientos

      } catch (error) {
        console.error('Error al guardar entrada:', error);
        Swal.fire('Error', 'No se pudo registrar la entrada', 'error');
      }
    });
  }

  static async setupOutputFormListener() {
    const form = document.getElementById('salidaForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const productId = document.getElementById('productoSalida').value;
      const quantity = document.getElementById('cantidadSalida').value;
      const date = document.getElementById('fechaSalida').value;
      const reason = document.getElementById('motivoSalida').value;
      const notes = document.getElementById('notasSalida').value;

      if (!productId || !quantity || !date || !reason) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
      }

      try {
        await MovementController.addOutput({
          productId,
          quantity,
          date,
          reason,
          notes
        });

        Swal.fire('Éxito', 'Salida registrada correctamente', 'success');
        form.reset();
        await this.loadMovementsTab(); // Recargar pestaña de movimientos

      } catch (error) {
        console.error('Error al guardar salida:', error);
        Swal.fire('Error', 'No se pudo registrar la salida', 'error');
      }
    });
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
        MovementController.getEntriesByDate(
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0]
        ),
        MovementController.getOutputsByDate(
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0]
        )
      ]);

      ChartController.initMovementsChart(entries, outputs, days);

    } catch (error) {
      console.error("Error actualizando gráfico de movimientos:", error);
    }
  }

  static async loadMovementsTab() {
    const tabContent = document.getElementById('movementsTabContent');
    if (!tabContent) return;

    try {
      tabContent.innerHTML = `
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Cargando movimientos...</p>
        </div>
      `;

      const [entries, outputs] = await Promise.all([
        MovementController.getAllEntries(),
        MovementController.getAllOutputs()
      ]);

      const html = `
        <!-- Pestañas -->
        <ul class="nav nav-tabs mb-3" id="movementTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="entradas-tab" data-bs-toggle="tab" data-bs-target="#entradas"
                    type="button" role="tab" aria-controls="entradas" aria-selected="true">Entradas</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="salidas-tab" data-bs-toggle="tab" data-bs-target="#salidas"
                    type="button" role="tab" aria-controls="salidas" aria-selected="false">Salidas</button>
          </li>
        </ul>

        <div class="tab-content" id="movementTabsContent">
          <!-- Entradas -->
          <div class="tab-pane fade show active" id="entradas" role="tabpanel">
            <table class="table table-hover">
              <thead><tr><th>Fecha</th><th>Producto</th><th>Proveedor</th><th>Cantidad</th><th>Notas</th></tr></thead>
              <tbody>
                ${entries.length ? entries.map(entry => `
                  <tr>
                    <td>${entry.date}</td>
                    <td>${entry.productName}</td>
                    <td>${entry.supplierName}</td>
                    <td>${entry.quantity}</td>
                    <td>${entry.notes || '-'}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="5" class="text-center text-muted">No hay entradas registradas</td></tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Salidas -->
          <div class="tab-pane fade" id="salidas" role="tabpanel">
            <table class="table table-hover">
              <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Motivo</th><th>Notas</th></tr></thead>
              <tbody>
                ${outputs.length ? outputs.map(output => `
                  <tr>
                    <td>${output.date}</td>
                    <td>${output.productName}</td>
                    <td>${output.quantity}</td>
                    <td>${output.reason || '-'}</td>
                    <td>${output.notes || '-'}</td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="5" class="text-center text-muted">No hay salidas registradas</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;

      tabContent.innerHTML = html;

      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));

    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      tabContent.innerHTML = `
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle me-2"></i>Error al cargar movimientos: ${error.message}
        </div>
      `;
    }
  }

  static async loadLowStockTable() {
    // Implementación pendiente
  }
}

export default UIController;
