// jss/main.js
import App from './app.js';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new App();
    await app.init();
    console.log('✅ Aplicación iniciada correctamente');
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
  }
});
