import pg from 'pg'
const { Pool } = pg
import dotenv from 'dotenv'

dotenv.config()

const dev = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`

const prod = process.env.DATABASE_URL

const pool = new Pool({
    connectionString: process.env.NODE_ENV === 'production' ? prod : dev,
})

export default pool
