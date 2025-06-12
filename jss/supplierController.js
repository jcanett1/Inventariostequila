// Controlador de proveedores
class SupplierController {
  static getAll() {
    return StorageController.getSuppliers();
  }

  static getById(id) {
    const suppliers = this.getAll();
    return suppliers.find(s => s.id === parseInt(id));
  }

  static add(supplier) {
    const suppliers = this.getAll();
    const newSupplier = {
      id: suppliers.length ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email || '',
      phone: supplier.phone || '',
      credit: parseFloat(supplier.credit || 0),
      materials: supplier.materials || ''
    };
    suppliers.push(newSupplier);
    StorageController.setSuppliers(suppliers);
    return newSupplier;
  }

  static update(id, updatedSupplier) {
    const suppliers = this.getAll();
    const index = suppliers.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      suppliers[index] = {
        ...suppliers[index],
        name: updatedSupplier.name,
        contact: updatedSupplier.contact,
        email: updatedSupplier.email,
        phone: updatedSupplier.phone,
        credit: parseFloat(updatedSupplier.credit),
        materials: updatedSupplier.materials
      };
      StorageController.setSuppliers(suppliers);
      return suppliers[index];
    }
    return null;
  }

  static delete(id) {
    const suppliers = this.getAll().filter(s => s.id !== parseInt(id));
    StorageController.setSuppliers(suppliers);
  }
}
