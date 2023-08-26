import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.HELLO);

const pool = new Pool({
    host: 'localhost',
    user: 'jnge',
    mac: 3,

});