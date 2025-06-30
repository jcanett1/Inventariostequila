import supabase from './supabaseClient.js';

class ProductController {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapeo correcto de propiedades
      return data.map(item => ({
        id: item.id,
        name: item.nombre || 'Sin nombre',
        description: item.descripcion || '',
        category: item.categoria || 'general',
        price: item.precio ? parseFloat(item.precio) : 0,
        stock: item.stock ? parseInt(item.stock) : 0
      }));
      
    } catch (error) {
      console.error("Error al obtener productos:", error.message);
      return [];
    }
  }

  static async add(product) {
    try {
      // Validación exhaustiva
      if (!product.name || typeof product.name !== 'string') {
        throw new Error('Nombre del producto inválido');
      }

      // Corrección del error de sintaxis (paréntesis faltante)
      const price = parseFloat(product.price);
      if (isNaN(price)) {
        throw new Error('Precio debe ser un número válido');
      }

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
        .select('*');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se creó el producto');

      console.log('Producto agregado:', data[0]);
      return {
        id: data[0].id,
        name: data[0].nombre,
        description: data[0].descripcion,
        category: data[0].categoria,
        price: parseFloat(data[0].precio),
        stock: parseInt(data[0].stock)
      };
      
    } catch (error) {
      console.error('Error en ProductController.add:', error.message);
      throw error; // Propaga el error para manejarlo en el UI
    }
  }

  static async update(id, updatedProduct) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({
          nombre: updatedProduct.name,
          descripcion: updatedProduct.description,
          categoria: updatedProduct.category,
          precio: parseFloat(updatedProduct.price),
          stock: parseInt(updatedProduct.stock) || 0
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Producto no encontrado');

      return {
        id: data[0].id,
        name: data[0].nombre,
        description: data[0].descripcion,
        category: data[0].categoria,
        price: parseFloat(data[0].precio),
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
