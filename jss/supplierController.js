// supplierController.js

import supabase from './supabaseClient.js';

class SupplierController {
  // Obtener todos los proveedores
  static async getAll() {
    const { data, error } = await supabase.from('proveedores').select('*');
    if (error) console.error("Error obteniendo proveedores:", error.message);
    return data || [];
  }

  // Obtener un proveedor por ID
  static async getById(id) {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error("Error obteniendo proveedor:", error.message);
    return data || null;
  }

  // Añadir un nuevo proveedor
  static async add(supplier) {
    const { data, error } = await supabase.from('proveedores').insert([{
      nombre: supplier.name,
      contacto: supplier.contact,
      correo: supplier.email || '',
      telefono: supplier.phone || '',
      credito: parseFloat(supplier.credit || 0),
      materiales: supplier.materials || ''
    }]).select();

    if (error) console.error("Error al agregar proveedor:", error.message);
    return data?.[0] || null;
  }

  // Actualizar un proveedor existente
  static async update(id, updatedSupplier) {
    const { data, error } = await supabase.from('proveedores')
      .update({
        nombre: updatedSupplier.name,
        contacto: updatedSupplier.contact,
        correo: updatedSupplier.email,
        telefono: updatedSupplier.phone,
        credito: parseFloat(updatedSupplier.credit || 0),
        materiales: updatedSupplier.materials
      })
      .eq('id', id)
      .select();

    if (error) console.error("Error al actualizar proveedor:", error.message);
    return data?.[0] || null;
  }

  // Eliminar un proveedor por ID
  static async delete(id) {
    const { error } = await supabase.from('proveedores').delete().eq('id', id);
    if (error) {
      console.error("Error al eliminar proveedor:", error.message);
      return false;
    }
    return true;
  }
}

export default SupplierController;
