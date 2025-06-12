import supabase from '/supabaseClient';

class ProductController {
  static async getAll() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error(error);
    return data || [];
  }

  static async add(product) {
    const { data, error } = await supabase.from('products').insert([{
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock || 0
    }]).select();
    if (error) console.error(error);
    return data?.[0] || null;
  }

  static async update(id, updatedProduct) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category,
        price: updatedProduct.price,
        stock: updatedProduct.stock
      })
      .eq('id', id)
      .select();
    if (error) console.error(error);
    return data?.[0] || null;
  }

  static async delete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error(error);
    return !error;
  }
}

export default ProductController;
