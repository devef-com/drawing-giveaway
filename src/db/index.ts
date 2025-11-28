import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.ts'

config()

const connectionString = process.env.DATABASE_URL!
const shouldUseSSL =
  process.env.PGSSLMODE === 'require' ||
  /sslmode=require/i.test(connectionString)

const pool = new Pool({
  connectionString,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined,
})

export const db = drizzle(pool, { schema })
