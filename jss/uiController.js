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

    // Esperar a que se complete la inserción
    const addedProduct = await ProductController.add(newProduct);
    console.log('Producto agregado:', addedProduct); // Verificación

    // Pequeño retraso para asegurar que Supabase haya actualizado
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Recargar la tabla
    await this.loadProductsTable();
    
    // Verificar si la tabla se actualizó
    console.log('Tabla recargada, verificando contenido...');
    console.log('Elementos en tabla:', document.querySelectorAll('#productosTableBody tr').length);

    form.reset();

    Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      showConfirmButton: false,
      timer: 1500
    });

  } catch (error) {
    console.error("Error completo al agregar producto:", error);
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
  console.log('Iniciando carga de tabla de productos...');
  const tbody = document.getElementById("productosTableBody");
  
  if (!tbody) {
    console.error('ERROR CRÍTICO: No se encontró el elemento con ID "productosTableBody"');
    return;
  }

  try {
    tbody.innerHTML = this.createLoadingRow();

    console.log('Obteniendo productos de Supabase...');
    const products = await ProductController.getAll();
    console.log('Productos obtenidos:', products);

    if (!products?.length) {
      console.log('No hay productos, mostrando mensaje');
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">No hay productos registrados</td>
        </tr>
      `;
      return;
    }

    console.log('Renderizando productos en tabla...');
    tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.name || "Sin nombre"}</td>
        <td>${product.category || "General"}</td>
        <td class="text-end">$${(product.price || 0).toFixed(2)}</td>
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

    console.log('Tabla renderizada correctamente');
    document.querySelectorAll('[title]').forEach(el => new bootstrap.Tooltip(el));

  } catch (error) {
    console.error("Error completo al cargar productos:", error);
    tbody.innerHTML = this.createErrorRow(error);
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
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      // Mostrar estado de carga
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';

      // Obtener datos del formulario
      const entradaData = {
        productId: document.getElementById('productoEntrada').value,
        supplierId: document.getElementById('proveedorEntrada').value,
        quantity: document.getElementById('cantidadEntrada').value,
        date: document.getElementById('fechaEntrada').value,
        notes: document.getElementById('notasEntrada').value
      };

      // Validación básica
      if (!entradaData.productId || !entradaData.quantity || !entradaData.date) {
        throw new Error('Todos los campos marcados con * son obligatorios');
      }

      // Enviar datos al servidor
      await MovementController.addEntry(entradaData);

      // Actualizar la interfaz
      await this.loadMovementsTab();
      
      // Mostrar feedback visual
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-success mt-3';
      alertDiv.textContent = 'Entrada registrada correctamente';
      form.prepend(alertDiv);
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        alertDiv.remove();
        form.reset();
      }, 2000);

    } catch (error) {
      console.error('Error al guardar entrada:', error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger mt-3';
      errorDiv.textContent = error.message;
      form.prepend(errorDiv);
      
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      // Restaurar botón
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
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

    if (window.ChartController && typeof window.ChartController.initMovementsChart === 'function') {
      window.ChartController.initMovementsChart(entries, outputs, days);
    }

  } catch (error) {
    console.error("Error actualizando gráfico de movimientos:", error);
    // Opcional: Mostrar notificación al usuario
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Error en gráfico',
        text: 'No se pudieron cargar los datos para el gráfico',
        footer: error.message
      });
    }
  }
}

static async loadMovementsTab() {
  try {
    const entradasBody = document.getElementById('entradasTableBody');
    const salidasBody = document.getElementById('salidasTableBody');

    // Mostrar carga
    const showLoading = (element) => {
      if (element) element.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </td>
        </tr>
      `;
    };

    showLoading(entradasBody);
    showLoading(salidasBody);

    // Obtener datos
    const [entries, outputs] = await Promise.all([
      MovementController.getRecentEntries(10),
      MovementController.getRecentOutputs(10)
    ]);

    // Renderizar directamente
    const renderTable = (element, data, type) => {
      if (!element) return;
      
      if (!data || data.length === 0) {
        element.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted">
              No hay ${type === 'entry' ? 'entradas' : 'salidas'}
            </td>
          </tr>
        `;
        return;
      }

      element.innerHTML = data.map(item => `
        <tr>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.productName}</td>
          ${type === 'entry' ? `<td>${item.supplierName}</td>` : `<td>${item.reason || '-'}</td>`}
          <td>${item.quantity}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-details"
                    data-id="${item.id}" data-type="${type}">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `).join('');
    };

    renderTable(entradasBody, entries, 'entry');
    renderTable(salidasBody, outputs, 'output');

    // Configurar eventos de detalles
    document.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        await this.showMovementDetails(id, type);
      });
    });

  } catch (error) {
    console.error("Error cargando movimientos:", error);
    
    // Mostrar error en ambas tablas
    const errorHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger py-4">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${error.message || 'Error al cargar datos'}
        </td>
      </tr>
    `;
    
    const entradasBody = document.getElementById('entradasTableBody');
    const salidasBody = document.getElementById('salidasTableBody');
    
    if (entradasBody) entradasBody.innerHTML = errorHTML;
    if (salidasBody) salidasBody.innerHTML = errorHTML;
    
    // Opcional: Mostrar alerta con SweetAlert
    if (typeof Swal !== 'undefined') {
      Swal.fire('Error', 'No se pudieron cargar los movimientos', 'error');
    }
  }
}

  // Métodos auxiliares
  static createLoadingRow() {
    return `
      <tr>
        <td colspan="5" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </td>
      </tr>
    `;
  }

  static createErrorRow(error) {
    return `
      <tr>
        <td colspan="5" class="text-center text-danger py-4">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${error.message || 'Error al cargar datos'}
        </td>
      </tr>
    `;
  }

  static createTableRows(data, type) {
    if (!data || data.length === 0) {
      return `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            No hay ${type === 'entry' ? 'entradas' : 'salidas'} registradas
          </td>
        </tr>
      `;
    }

    return data.map(item => `
      <tr>
        <td>${new Date(item.date).toLocaleDateString()}</td>
        <td>${item.productName}</td>
        ${type === 'entry' ? `<td>${item.supplierName}</td>` : `<td>${item.reason}</td>`}
        <td>${item.quantity}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary view-detail" 
                  data-id="${item.id}" data-type="${type}">
            <i class="fas fa-eye"></i> Detalles
          </button>
        </td>
      </tr>
    `).join('');
  }

  static setupMovementDetailButtons() {
    document.querySelectorAll('.view-detail').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const type = button.dataset.type;
        await this.showMovementDetails(id, type);
      });
    });
  }

  static async showMovementDetails(id, type) {
    try {
      const movement = await MovementController.getMovementById(id, type);
      const modal = new bootstrap.Modal(document.getElementById('movementDetailModal'));
      
      // Configurar contenido del modal
      document.getElementById('movementDetailContent').innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <p><strong>Producto:</strong> ${movement.productName}</p>
            <p><strong>Fecha:</strong> ${new Date(movement.date).toLocaleString()}</p>
            ${type === 'entry' ? 
              `<p><strong>Proveedor:</strong> ${movement.supplierName}</p>` : 
              `<p><strong>Motivo:</strong> ${movement.reason}</p>`}
          </div>
          <div class="col-md-6">
            <p><strong>Cantidad:</strong> ${movement.quantity}</p>
            <p><strong>Notas:</strong> ${movement.notes || 'Ninguna'}</p>
          </div>
        </div>
      `;
      
      modal.show();
      
    } catch (error) {
      console.error("Error mostrando detalles:", error);
      if (typeof Swal !== 'undefined') {
        Swal.fire('Error', 'No se pudieron cargar los detalles', 'error');
      }
    }
  }

  static async loadLowStockTable() {
    // Implementación pendiente
  }
}

export default UIController;
