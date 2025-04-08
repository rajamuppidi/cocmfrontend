import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'your_password',
  database: process.env.MYSQL_DATABASE || 'caseload_tracker',
});

export default pool;
