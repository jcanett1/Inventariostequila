import supabase from './supabaseClient.js';

class ProductController {
  static async getAll() {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) console.error("Error al obtener productos:", error.message);
    return data || [];
  }

  static async add(product) {
  try {
    // Validación exhaustiva de los datos
    if (!product.name || typeof product.name !== 'string') {
      throw new Error('Nombre del producto inválido');
    }

    // Convertir y validar el precio
    const price = parseFloat(product.price);
    if (isNaN(price) {
      throw new Error('Precio debe ser un número válido');
    }

    // Convertir y validar el stock
    const stock = parseInt(product.stock) || 0;

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: product.name.trim(),
        descripcion: product.description?.trim() || '',
        categoria: product.category?.trim() || 'general',
        precio: price,
        stock: stock
      }])
      .select('*'); // Asegúrate de seleccionar todos los campos

    if (error) {
      console.error("Error Supabase:", error);
      throw new Error(`Error al guardar: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No se recibieron datos de respuesta');
    }

    console.log('Producto agregado:', data[0]);
    return data[0];
    
  } catch (error) {
    console.error('Error en Product.add:', error);
    App.showErrorState(error.message);
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
