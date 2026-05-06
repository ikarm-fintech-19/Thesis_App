const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://postgres:6srDeAHBq4y2VGrc@db.jklisqvugxfzqlbmvlmi.supabase.co:5432/postgres",
  });

  try {
    console.log('Attempting to connect to Supabase...');
    await client.connect();
    console.log('SUCCESS: Connected to PostgreSQL!');
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('CONNECTION ERROR:', err.message);
    console.error('Checking for common issues...');
    if (err.message.includes('ENOTFOUND')) {
      console.error('DNS Error: The hostname could not be resolved.');
    }
  }
}

testConnection();
