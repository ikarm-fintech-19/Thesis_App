const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = "postgresql://postgres.jklisqvugxfzqlbmvlmi:6srDeAHBq4y2VGrc@aws-1-eu-west-3.pooler.supabase.com:5432/postgres";
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase for SQL migration...');
    await client.connect();
    
    const sqlPath = path.join(__dirname, '../supabase/migrations/001_tva_rules.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing 001_tva_rules.sql...');
    // Split by common separators if needed, but for now just run the whole block
    // Note: Some SQL blocks might fail if they contain 'CREATE OR REPLACE' and are not properly terminated
    // But usually psql-compatible content is fine.
    await client.query(sql);
    
    console.log('SUCCESS: SQL Migration executed successfully!');
  } catch (err) {
    console.error('MIGRATION ERROR:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.where) console.error('Where:', err.where);
  } finally {
    await client.end();
  }
}

runMigration();
