// Importar createClient desde CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuración
const supabaseUrl = 'https://bwkvfwrrlizhqdpaxfmb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a3Zmd3JybGl6aHFkcGF4Zm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTIyODMsImV4cCI6MjA2NTMyODI4M30.6ryUGUVRcDtASw0s1RTnKwSA4ezn_I_oxHeuSWGmwFU'

// Crear y exportar el cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Función para probar conexión
export async function testConnection() {
  try {
    const { error } = await supabase
      .from('productos')
      .select('*')
      .limit(1)
    return !error
  } catch (error) {
    console.error("Error probando conexión:", error)
    return false
  }
}

export default supabase
