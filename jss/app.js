// js/app.js


document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Ejecutando DOMContentLoaded...");

    if (typeof UIController !== 'undefined') {
      if (typeof UIController.init === 'function') {
        await UIController.init(); // Inicializar la interfaz
      } else {
        throw new Error("UIController.init no es una función");
      }
    } else {
      throw new Error("UIController no está definido");
    }

  } catch (e) {
    console.error("Error durante la inicialización:", e.message);
  }
});
