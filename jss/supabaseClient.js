// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bwkvfwrrlizhqdpaxfmb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a3Zmd3JybGl6aHFkcGF4Zm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTIyODMsImV4cCI6MjA2NTMyODI4M30.6ryUGUVRcDtASw0s1RTnKwSA4ezn_I_oxHeuSWGmwFU'

// Crear y exportar el cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Exportación nombrada (recomendada)
export { supabase }

// O exportación por defecto (alternativa)
// export default supabase
