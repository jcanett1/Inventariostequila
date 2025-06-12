// movementController.js

// js/movementController.js

import supabase from './supabaseClient.js';

class MovementController {
  // Obtener todas las entradas
  static async getAllEntries() {
    const { data, error } = await supabase.from('entradas').select(`
      id,
      product_id,
      supplier_id,
      quantity,
      date,
      notes
    `);
    if (error) console.error("Error obteniendo entradas:", error.message);
    return data || [];
  }

  // Obtener todas las salidas
  static async getAllOutputs() {
    const { data, error } = await supabase.from('salidas').select(`
      id,
      product_id,
      quantity,
      date,
      reason,
      notes
    `);
    if (error) console.error("Error obteniendo salidas:", error.message);
    return data || [];
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
    if (error) console.error("Error al guardar entrada:", error.message);
    return data?.[0] || null;
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
    if (error) console.error("Error al guardar salida:", error.message);
    return data?.[0] || null;
  }

  // Filtrar entradas por rango de fechas
  static async getEntriesByDate(startDate, endDate) {
    const { data, error } = await supabase.from('entradas')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) console.error("Error al filtrar entradas:", error.message);
    return data || [];
  }

  // Filtrar salidas por rango de fechas
  static async getOutputsByDate(startDate, endDate) {
    const { data, error } = await supabase.from('salidas')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    if (error) console.error("Error al filtrar salidas:", error.message);
    return data || [];
  }
}

export default MovementController;
