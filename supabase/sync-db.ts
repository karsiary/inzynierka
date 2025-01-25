import { createClient } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

async function syncDatabaseSchema() {
  try {
    // Sprawdź czy zmienne środowiskowe są ustawione
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Brakujące zmienne środowiskowe SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY')
    }

    // Utwórz klienta Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Pobierz aktualną strukturę bazy danych
    const { data: schema, error } = await supabase
      .rpc('get_schema')
      .select('*')

    if (error) throw error

    // Zapisz strukturę do pliku
    const outputDir = path.join(process.cwd(), 'supabase/schemas')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputPath = path.join(outputDir, `schema-${timestamp}.json`)
    
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2))
    console.log(`Schemat bazy zapisano w: ${outputPath}`)

  } catch (error) {
    console.error('Błąd podczas synchronizacji schematu:', error)
    process.exit(1)
  }
}

syncDatabaseSchema() 