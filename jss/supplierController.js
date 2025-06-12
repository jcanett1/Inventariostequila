// supplierController.js

import supabase from '/supabaseClient';

class SupplierController {
  // Obtener todos los proveedores
  static async getAll() {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) console.error("Error obteniendo proveedores:", error.message);
    return data || [];
  }

  // Obtener un proveedor por ID
  static async getById(id) {
    const { data, error } = await supabase.from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error("Error obteniendo proveedor:", error.message);
    return data || null;
  }

  // Añadir un nuevo proveedor
  static async add(supplier) {
    const { data, error } = await supabase.from('suppliers').insert([{
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email || '',
      phone: supplier.phone || '',
      credit: parseFloat(supplier.credit || 0),
      materials: supplier.materials || ''
    }]).select();
    if (error) console.error("Error al agregar proveedor:", error.message);
    return data?.[0] || null;
  }

  // Actualizar un proveedor existente
  static async update(id, updatedSupplier) {
    const { data, error } = await supabase.from('suppliers')
      .update({
        name: updatedSupplier.name,
        contact: updatedSupplier.contact,
        email: updatedSupplier.email,
        phone: updatedSupplier.phone,
        credit: parseFloat(updatedSupplier.credit || 0),
        materials: updatedSupplier.materials
      })
      .eq('id', id)
      .select();
    if (error) console.error("Error al actualizar proveedor:", error.message);
    return data?.[0] || null;
  }

  // Eliminar un proveedor por ID
  static async delete(id) {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) {
      console.error("Error al eliminar proveedor:", error.message);
      return false;
    }
    return true;
  }
}

export default SupplierController;
