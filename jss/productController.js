import supabase from './supabaseClient.js';

class ProductController {
  static async getAll() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('name', { ascending: true }); // Ordenar por name en lugar de created_at

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name || 'Sin nombre',
      description: item.description || '',
      category: item.category || 'general',
      price: item.price ? parseFloat(item.price) : 0,
      stock: item.stock ? parseInt(item.stock) : 0
    }));
    
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    return [];
  }
}

  static async add(product) {
  try {
    // Validación mejorada
    if (!product.name?.trim()) {
      throw new Error('Nombre del producto es requerido');
    }
    
    if (typeof product.price !== 'number' || product.price <= 0) {
      throw new Error('Precio debe ser un número positivo');
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        name: product.name.trim(),
        description: product.description?.trim() || '',
        category: product.category?.trim() || 'general',
        price: product.price,
        stock: product.stock || 0
      }])
      .select('*');

    if (error) {
      console.error('Error de Supabase:', error);
      throw new Error(error.message || 'Error al guardar en base de datos');
    }

    if (!data?.length) {
      throw new Error('No se recibieron datos del servidor');
    }

    return {
      id: data[0].id,
      ...data[0]
    };
    
  } catch (error) {
    console.error('Error en ProductController.add:', error);
    throw error;
  }
}

  static async update(id, updatedProduct) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          category: updatedProduct.category,
          price: parseFloat(updatedProduct.price),
          stock: parseInt(updatedProduct.stock) || 0
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Producto no encontrado');

      return {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description,
        category: data[0].category,
        price: parseFloat(data[0].price),
        stock: parseInt(data[0].stock)
      };
      
    } catch (error) {
      console.error("Error al actualizar producto:", error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
      
    } catch (error) {
      console.error("Error al eliminar producto:", error.message);
      throw error;
    }
  }
}

export default ProductController;
