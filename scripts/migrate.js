import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Read schema
    const schemaPath = join(process.cwd(), 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await sql.query(statement + ';');
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message?.includes('already exists')) {
          console.log('✓ Already exists, skipping');
        } else {
          console.error('✗ Error:', err.message);
        }
      }
    }
    
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
