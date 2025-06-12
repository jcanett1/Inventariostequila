// js/StorageController.js

import supabase from './supabaseClient.js';

class StorageController {
  // Productos
  static async getProducts() {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) console.error("Error al obtener productos:", error.message);
    return data || [];
  }

  static async setProducts(products) {
    // Reemplaza toda la tabla (útil solo en desarrollo)
    const { error: deleteError } = await supabase.from('productos').delete().neq('id', null); // Elimina todo
    if (deleteError) console.error("Error al limpiar productos:", deleteError.message);

    const { error: insertError } = await supabase.from('productos').insert(products);
    if (insertError) console.error("Error al guardar productos:", insertError.message);
  }

  // Proveedores
  static async getSuppliers() {
    const { data, error } = await supabase.from('proveedores').select('*');
    if (error) console.error("Error al obtener proveedores:", error.message);
    return data || [];
  }

  static async setSuppliers(suppliers) {
    const { error: deleteError } = await supabase.from('proveedores').delete().neq('id', null);
    if (deleteError) console.error("Error al limpiar proveedores:", deleteError.message);

    const { error: insertError } = await supabase.from('proveedores').insert(suppliers);
    if (insertError) console.error("Error al guardar proveedores:", insertError.message);
  }

  // Entradas
  static async getEntries() {
    const { data, error } = await supabase.from('entradas').select('*');
    if (error) console.error("Error al obtener entradas:", error.message);
    return data || [];
  }

  static async setEntries(entries) {
    const { error: deleteError } = await supabase.from('entradas').delete().neq('id', null);
    if (deleteError) console.error("Error al limpiar entradas:", deleteError.message);

    const { error: insertError } = await supabase.from('entradas').insert(entries);
    if (insertError) console.error("Error al guardar entradas:", insertError.message);
  }

  // Salidas
  static async getOutputs() {
    const { data, error } = await supabase.from('salidas').select('*');
    if (error) console.error("Error al obtener salidas:", error.message);
    return data || [];
  }

  static async setOutputs(outputs) {
    const { error: deleteError } = await supabase.from('salidas').delete().neq('id', null);
    if (deleteError) console.error("Error al limpiar salidas:", deleteError.message);

    const { error: insertError } = await supabase.from('salidas').insert(outputs);
    if (insertError) console.error("Error al guardar salidas:", insertError.message);
  }
}

export default StorageController;
