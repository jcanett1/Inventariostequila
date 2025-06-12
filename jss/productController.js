// Controlador de productos
class ProductController {
  static getAll() {
    return StorageController.getProducts();
  }

  static getById(id) {
    const products = this.getAll();
    return products.find(p => p.id === parseInt(id));
  }

  static add(product) {
    const products = this.getAll();
    const newProduct = {
      id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
      name: product.name,
      description: product.description,
      category: product.category,
      price: parseFloat(product.price),
      stock: parseInt(product.stock || 0)
    };
    products.push(newProduct);
    StorageController.setProducts(products);
    return newProduct;
  }

  static update(id, updatedProduct) {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        price: parseFloat(updatedProduct.price),
        stock: parseInt(updatedProduct.stock)
      };
      StorageController.setProducts(products);
      return products[index];
    }
    return null;
  }

  static delete(id) {
    const products = this.getAll().filter(p => p.id !== parseInt(id));
    StorageController.setProducts(products);
  }

  static updateStock(productId, quantity) {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === parseInt(productId));
    if (index !== -1) {
      products[index].stock += parseInt(quantity);
      StorageController.setProducts(products);
    }
  }
}
