// js/productController.js

import supabase from './supabaseClient.js';

class ProductController {
  static async getAll() {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) console.error("Error al obtener productos:", error.message);
    return data || [];
  }

  static async add(product) {
    const { data, error } = await supabase.from('productos').insert([{
      nombre: product.name,
      descripcion: product.description,
      categoria: product.category,
      precio: product.price,
      stock: product.stock || 0
    }]).select();
    if (error) console.error("Error al guardar producto:", error.message);
    return data?.[0] || null;
  }

  static async update(id, updatedProduct) {
    const { data, error } = await supabase
      .from('productos')
      .update({
        nombre: updatedProduct.name,
        descripcion: updatedProduct.description,
        categoria: updatedProduct.category,
        precio: updatedProduct.price,
        stock: updatedProduct.stock
      })
      .eq('id', id)
      .select();
    if (error) console.error("Error al actualizar producto:", error.message);
    return data?.[0] || null;
  }

  static async delete(id) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) console.error("Error al eliminar producto:", error.message);
    return !error;
  }
}

export default ProductController;
