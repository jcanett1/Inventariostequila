// Importar createClient desde CDN
const { createClient } = window.supabase;

// Configuración de Supabase
const SUPABASE_CONFIG = {
  url: 'https://bwkvfwrrlizhqdpaxfmb.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a3Zmd3JybGl6aHFkcGF4Zm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTIyODMsImV4cCI6MjA2NTMyODI4M30.6ryUGUVRcDtASw0s1RTnKwSA4ezn_I_oxHeuSWGmwFU'
};

// Crear y exportar el cliente Supabase
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Exportar como objeto global
window.SupabaseClient = {
  supabase,
  async testConnection() {
    try {
      const { error } = await supabase
        .from('productos')
        .select('*')
        .limit(1);
      return !error;
    } catch (error) {
      console.error("Error testing Supabase connection:", error);
      return false;
    }
  }
};
