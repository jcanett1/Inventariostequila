// Configuración de Supabase
const supabaseUrl = 'https://bwkvfwrrlizhqdpaxfmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a3Zmd3JybGl6aHFkcGF4Zm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTIyODMsImV4cCI6MjA2NTMyODI4M30.6ryUGUVRcDtASw0s1RTnKwSA4ezn_I_oxHeuSWGmwFU';

// Crear instancia de Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Función para probar la conexión
async function testConnection() {
  try {
    const { error } = await supabase
      .from('productos')
      .select('*')
      .limit(1);
    return !error;
  } catch (error) {
    console.error("Error testing connection:", error);
    return false;
  }
}

// Exportar al ámbito global
window.SupabaseService = { supabase, testConnection };
