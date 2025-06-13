// js/app.js

import * as UIController from './uiController.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Inicializando sistema...");
    await UIController.init(); // Carga la interfaz desde Supabase
  } catch (e) {
    console.error("Error durante la inicialización:", e.message);
  }
});
