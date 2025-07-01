// supplierController.js

import supabase from './supabaseClient.js';

class SupplierController {
  static async getAll() {
    const { data, error } = await supabase.from('"Proveedores"').select('*');
    if (error) console.error("Error obteniendo proveedores:", error.message);
    return data || [];
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('"Proveedores"')
      .select('*')
      .eq('id', id)
      .single();
    if (error) console.error("Error obteniendo proveedor:", error.message);
    return data || null;
  }

  static async add(supplier) {
    try {
      if (!supplier.name || typeof supplier.name !== 'string') {
        throw new Error('Nombre del proveedor es requerido');
      }

      const { data, error } = await supabase
        .from('"Proveedores"') // ← Aquí corregimos
        .insert([{
          nombre: supplier.name.trim(),
          contacto: supplier.contact?.trim() || '',
          correo: supplier.email?.trim() || '',
          telefono: supplier.phone?.trim() || '',
          credito: parseFloat(supplier.credit || 0),
          materiales: supplier.materials?.trim() || ''
        }])
        .select();

      if (error) throw error;
      if (!data?.length) throw new Error('No se recibieron datos del servidor');

      return {
        id: data[0].id,
        ...data[0]
      };

    } catch (error) {
      console.error('Error en SupplierController.add:', error);
      throw new Error(error.message || 'Error al agregar proveedor');
    }
  }

  static async update(id, updatedSupplier) {
    const { data, error } = await supabase
      .from('"Proveedores"') // ← Aquí corregimos
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

  static async delete(id) {
    const { error } = await supabase
      .from('"Proveedores"') // ← Aquí corregimos
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error al eliminar proveedor:", error.message);
      return false;
    }
    return true;
  }
}

export default SupplierController;
