// Importación desde CDN con fallback
let supabase;

try {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  const supabaseUrl = 'https://bwkvfwrrlizhqdpaxfmb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a3Zmd3JybGl6aHFkcGF4Zm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTIyODMsImV4cCI6MjA2NTMyODI4M30.6ryUGUVRcDtASw0s1RTnKwSA4ezn_I_oxHeuSWGmwFU';

  supabase = createClient(supabaseUrl, supabaseKey);

  // Función de verificación de conexión
  async function testConnection() {
    const { error } = await supabase
      .from('productos')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    return true;
  }

  export { supabase, testConnection };

} catch (error) {
  console.error("Error al cargar Supabase:", error);
  // Exportar versión mock para desarrollo
  export const supabase = {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    })
  };
  export const testConnection = () => Promise.resolve(false);
}
