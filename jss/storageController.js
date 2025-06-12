// Controlador de almacenamiento en localStorage
class StorageController {
  static getProducts() {
    return JSON.parse(localStorage.getItem('products') || '[]');
  }

  static setProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getSuppliers() {
    return JSON.parse(localStorage.getItem('suppliers') || '[]');
  }

  static setSuppliers(suppliers) {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }

  static getEntries() {
    return JSON.parse(localStorage.getItem('entries') || '[]');
  }

  static setEntries(entries) {
    localStorage.setItem('entries', JSON.stringify(entries));
  }

  static getOutputs() {
    return JSON.parse(localStorage.getItem('outputs') || '[]');
  }

  static setOutputs(outputs) {
    localStorage.setItem('outputs', JSON.stringify(outputs));
  }
}
