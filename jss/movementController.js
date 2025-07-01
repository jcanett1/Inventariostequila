// js/movementController.js

import supabase from './supabaseClient.js';

class MovementController {
  // Obtener todas las entradas con nombres de producto y proveedor
  static async getAllEntries() {
    const { data, error } = await supabase.from('entradas').select(`
      id,
      product_id,
      supplier_id,
      quantity,
      date,
      notes,
      productos!inner(nombre),
      proveedores!inner(name)
    `);

    if (error) {
      console.error("Error obteniendo entradas:", error.message);
      return [];
    }

    return data.map(entry => ({
      id: entry.id,
      productName: entry.productos?.nombre || 'Desconocido', // ✅ Aquí cambiamos ID por NOMBRE
      supplierName: entry.proveedores?.name || 'Desconocido', // ✅ Aquí cambiamos ID por NOMBRE
      quantity: entry.quantity,
      date: entry.date,
      notes: entry.notes
    }));
  }

  // Obtener todas las salidas con nombre de producto
  static async getAllOutputs() {
    const { data, error } = await supabase.from('salidas').select(`
      id,
      product_id,
      quantity,
      date,
      reason,
      notes,
      productos!inner(nombre)
    `);

    if (error) {
      console.error("Error obteniendo salidas:", error.message);
      return [];
    }

    return data.map(output => ({
      id: output.id,
      productName: output.productos?.nombre || 'Desconocido', // ✅ Aquí cambiamos ID por NOMBRE
      quantity: output.quantity,
      date: output.date,
      reason: output.reason,
      notes: output.notes
    }));
  }

  // Añadir una entrada
  static async addEntry(entry) {
    const { data, error } = await supabase.from('entradas').insert([{
      product_id: parseInt(entry.productId),
      supplier_id: parseInt(entry.supplierId),
      quantity: parseInt(entry.quantity),
      date: entry.date,
      notes: entry.notes || ''
    }]).select();

    if (error) {
      console.error("Error al guardar entrada:", error.message);
      return null;
    }

    return {
      id: data[0].id,
      productName: data[0].productos?.nombre || 'Desconocido',
      supplierName: data[0].proveedores?.name || 'Desconocido',
      quantity: data[0].quantity,
      date: data[0].date,
      notes: data[0].notes
    };
  }

  // Añadir una salida
  static async addOutput(output) {
    const { data, error } = await supabase.from('salidas').insert([{
      product_id: parseInt(output.productId),
      quantity: parseInt(output.quantity),
      date: output.date,
      reason: output.reason,
      notes: output.notes || ''
    }]).select();

    if (error) {
      console.error("Error al guardar salida:", error.message);
      return null;
    }

    return {
      id: data[0].id,
      productName: data[0].productos?.nombre || 'Desconocido',
      quantity: data[0].quantity,
      date: data[0].date,
      reason: data[0].reason,
      notes: data[0].notes
    };
  }

  // Filtrar entradas por rango de fechas
  static async getEntriesByDate(startDate, endDate) {
    const { data, error } = await supabase.from('entradas')
      .select(`
        id,
        product_id,
        supplier_id,
        quantity,
        date,
        notes,
        productos!inner(nombre),
        proveedores!inner(name)
      `)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error("Error al filtrar entradas:", error.message);
      return [];
    }

    return data.map(entry => ({
      id: entry.id,
      productName: entry.productos?.nombre || 'Desconocido',
      supplierName: entry.proveedores?.name || 'Desconocido',
      quantity: entry.quantity,
      date: entry.date,
      notes: entry.notes
    }));
  }

  // Filtrar salidas por rango de fechas
  static async getOutputsByDate(startDate, endDate) {
    const { data, error } = await supabase.from('salidas')
      .select(`
        id,
        product_id,
        quantity,
        date,
        reason,
        notes,
        productos!inner(nombre)
      `)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error("Error al filtrar salidas:", error.message);
      return [];
    }

    return data.map(output => ({
      id: output.id,
      productName: output.productos?.nombre || 'Desconocido',
      quantity: output.quantity,
      date: output.date,
      reason: output.reason,
      notes: output.notes
    }));
  }
}

export default MovementController;
