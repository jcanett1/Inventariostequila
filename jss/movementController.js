import supabase from './supabaseClient.js';

class MovementController {
  /**
   * Obtiene todas las entradas con información relacionada
   * @returns {Promise<Array>} Lista de entradas
   */
  static async getAllEntries() {
    const { data, error } = await supabase
      .from('entradas')
      .select(`
        id,
        product_id,
        supplier_id,
        quantity,
        date,
        notes,
        productos:product_id(name),
        proveedores:supplier_id(name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error obteniendo entradas:", error.message);
      throw error;
    }

    return data.map(entry => this.formatEntry(entry));
  }

  /**
   * Obtiene entradas recientes con límite
   * @param {number} limit - Número máximo de entradas a devolver
   * @returns {Promise<Array>} Lista de entradas recientes
   */
static async getRecentEntries(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('entradas')
        .select(`
          id,
          product_id,
          supplier_id,
          quantity,
          date,
          notes,
          productos!entradas_product_id_fkey(name),
          proveedores!entradas_supplier_id_fkey(name)
        `)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(entry => this.formatEntry(entry));

    } catch (error) {
      console.error("Error obteniendo entradas recientes:", error);
      throw error;
    }
  }

  /**
   * Obtiene todas las salidas con información relacionada
   * @returns {Promise<Array>} Lista de salidas
   */
  static async getAllOutputs() {
    const { data, error } = await supabase
      .from('salidas')
      .select(`
        id,
        product_id,
        quantity,
        date,
        reason,
        notes,
        productos:product_id(name)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error obteniendo salidas:", error.message);
      throw error;
    }

    return data.map(output => this.formatOutput(output));
  }

  /**
   * Obtiene salidas recientes con límite
   * @param {number} limit - Número máximo de salidas a devolver
   * @returns {Promise<Array>} Lista de salidas recientes
   */
 // Método para obtener salidas recientes
  static async getRecentOutputs(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('salidas')
        .select(`
          id,
          product_id,
          quantity,
          date,
          reason,
          notes,
          productos!salidas_product_id_fkey(name)
        `)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(output => this.formatOutput(output));

    } catch (error) {
      console.error("Error obteniendo salidas recientes:", error);
      throw error;
    }
  }

  /**
   * Registra una nueva entrada
   * @param {Object} entryData - Datos de la entrada
   * @returns {Promise<Object>} Entrada creada
   */
  static async addEntry(entryData) {
    const { data, error } = await supabase
      .from('entradas')
      .insert([{
        product_id: entryData.productId,
        supplier_id: entryData.supplierId,
        quantity: parseInt(entryData.quantity),
        date: entryData.date,
        notes: entryData.notes || ''
      }])
      .select(`
        id,
        product_id,
        supplier_id,
        quantity,
        date,
        notes,
        productos:product_id(name),
        proveedores:supplier_id(name)
      `);

    if (error) {
      console.error("Error al guardar entrada:", error.message);
      throw error;
    }

    return this.formatEntry(data[0]);
  }

  /**
   * Registra una nueva salida
   * @param {Object} outputData - Datos de la salida
   * @returns {Promise<Object>} Salida creada
   */
  static async addOutput(outputData) {
    const { data, error } = await supabase
      .from('salidas')
      .insert([{
        product_id: outputData.productId,
        quantity: parseInt(outputData.quantity),
        date: outputData.date,
        reason: outputData.reason,
        notes: outputData.notes || ''
      }])
      .select(`
        id,
        product_id,
        quantity,
        date,
        reason,
        notes,
        productos:product_id(name)
      `);

    if (error) {
      console.error("Error al guardar salida:", error.message);
      throw error;
    }

    return this.formatOutput(data[0]);
  }

  /**
   * Obtiene un movimiento específico por ID y tipo
   * @param {string} id - ID del movimiento
   * @param {string} type - Tipo de movimiento ('entry' o 'output')
   * @returns {Promise<Object>} Datos del movimiento
   */
  static async getMovementById(id, type = 'entry') {
    const tableName = type === 'entry' ? 'entradas' : 'salidas';
    const selectFields = type === 'entry' ? 
      `*, productos:product_id(name), proveedores:supplier_id(name)` : 
      `*, productos:product_id(name)`;

    const { data, error } = await supabase
      .from(tableName)
      .select(selectFields)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error obteniendo movimiento (${type}):`, error.message);
      throw error;
    }

    return type === 'entry' ? this.formatEntry(data) : this.formatOutput(data);
  }

  /**
   * Filtra entradas por rango de fechas
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Entradas filtradas
   */
  static async getEntriesByDate(startDate, endDate) {
    const { data, error } = await supabase
      .from('entradas')
      .select(`
        id,
        product_id,
        supplier_id,
        quantity,
        date,
        notes,
        productos:product_id(name),
        proveedores:supplier_id(name)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error filtrando entradas por fecha:", error.message);
      throw error;
    }

    return data.map(entry => this.formatEntry(entry));
  }

  /**
   * Filtra salidas por rango de fechas
   * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
   * @returns {Promise<Array>} Salidas filtradas
   */
  static async getOutputsByDate(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('salidas')
      .select(`
        id,
        product_id,
        quantity,
        date,
        reason,
        notes,
        productos!salidas_product_id_fkey(name)  // Especifica la relación exacta
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(output => ({
      id: output.id,
      productId: output.product_id,
      productName: output.productos?.name || 'Desconocido',
      quantity: output.quantity,
      date: output.date,
      reason: output.reason,
      notes: output.notes
    }));

  } catch (error) {
    console.error("Error filtrando salidas por fecha:", error);
    throw new Error("No se pudieron filtrar las salidas por fecha");
  }
}

  // Métodos auxiliares de formato
  static formatEntry(entry) {
    return {
      id: entry.id,
      productId: entry.product_id,
      productName: entry.productos?.name || 'Desconocido',
      supplierId: entry.supplier_id,
      supplierName: entry.proveedores?.name || 'Desconocido',
      quantity: entry.quantity,
      date: entry.date,
      notes: entry.notes,
      type: 'entry'
    };
  }

  static formatOutput(output) {
    return {
      id: output.id,
      productId: output.product_id,
      productName: output.productos?.name || 'Desconocido',
      quantity: output.quantity,
      date: output.date,
      reason: output.reason,
      notes: output.notes,
      type: 'output'
    };
  }
}

export default MovementController;
