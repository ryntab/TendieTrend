import Knex from 'knex'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL)

const knex = Knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
  },
})

async function testConnection() {
  try {
    const result = await knex.raw('SELECT NOW()')
    console.log('✅ DB TIME:', result.rows[0])
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    process.exit(1)
  }
}

testConnection()

export default knex
