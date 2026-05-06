const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres.jklisqvugxfzqlbmvlmi:6srDeAHBq4y2VGrc@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });

  try {
    console.log('Attempting to connect to Supabase Pooler (EU-Central)...');
    await client.connect();
    console.log('SUCCESS: Connected to PostgreSQL Pooler!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('CONNECTION ERROR:', err.message);
  }
}

testConnection();
