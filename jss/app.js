// js/app.js

import UIController from './uiController.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Ejecutando DOMContentLoaded...");
    await UIController.init();
  } catch (e) {
    console.error("Error durante la inicialización:", e.message);
  }
});
