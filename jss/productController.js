import supabase from './supabaseClient.js';

class ProductController {
  static async getAll() {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) console.error("Error al obtener productos:", error.message);
    return data || [];
  }

  static async add(product) {
  try {
    // Validación básica de los datos del producto
    if (!product.name || !product.price) {
      throw new Error('Nombre y precio son campos requeridos');
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: product.name,
        descripcion: product.description || '',
        categoria: product.category || 'sin-categoria',
        precio: Number(product.price),
        stock: Number(product.stock) || 0
      }])
      .select();

    if (error) {
      console.error("Error al guardar producto:", error.message);
      throw error;
    }

    // Actualiza la UI después de agregar
    await UIController.updateProductList();
    await UIController.updateCategoryChart();

    return data?.[0] || null;
  } catch (error) {
    console.error('Error en Product.add:', error);
    App.showErrorState('Error al agregar producto');
    return null;
  }
}

  static async update(id, updatedProduct) {
    const { data, error } = await supabase
      .from('productos')
      .update({
        nombre: updatedProduct.name,
        descripcion: updatedProduct.descripcion,
        categoria: updatedProduct.categoria,
        precio: updatedProduct.precio,
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
