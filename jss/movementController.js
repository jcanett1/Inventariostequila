// Controlador de movimientos (entradas y salidas)
class MovementController {
  static getAllEntries() {
    return StorageController.getEntries();
  }

  static getAllOutputs() {
    return StorageController.getOutputs();
  }

  static addEntry(entry) {
    const entries = this.getAllEntries();
    const newEntry = {
      id: entries.length ? Math.max(...entries.map(e => e.id)) + 1 : 1,
      productId: parseInt(entry.productId),
      supplierId: parseInt(entry.supplierId),
      quantity: parseInt(entry.quantity),
      date: entry.date,
      notes: entry.notes || ''
    };
    entries.push(newEntry);
    StorageController.setEntries(entries);
    ProductController.updateStock(newEntry.productId, newEntry.quantity);
    return newEntry;
  }

  static addOutput(output) {
    const outputs = this.getAllOutputs();
    const newOutput = {
      id: outputs.length ? Math.max(...outputs.map(o => o.id)) + 1 : 1,
      productId: parseInt(output.productId),
      quantity: parseInt(output.quantity),
      date: output.date,
      reason: output.reason,
      notes: output.notes || ''
    };
    // Validar stock suficiente
    const product = ProductController.getById(newOutput.productId);
    if (product && product.stock < newOutput.quantity) {
      throw new Error(`Stock insuficiente para ${product.name}`);
    }
    outputs.push(newOutput);
    StorageController.setOutputs(outputs);
    ProductController.updateStock(newOutput.productId, -newOutput.quantity);
    return newOutput;
  }

  static getRecentEntries(limit = 10) {
    const entries = this.getAllEntries();
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  }

  static getRecentOutputs(limit = 10) {
    const outputs = this.getAllOutputs();
    return outputs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  }

  static getByDate(startDate, endDate) {
    const entries = this.getAllEntries().filter(e => {
      return new Date(e.date) >= startDate && new Date(e.date) <= endDate;
    });
    const outputs = this.getAllOutputs().filter(o => {
      return new Date(o.date) >= startDate && new Date(o.date) <= endDate;
    });
    return { entries, outputs };
  }
}
