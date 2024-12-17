import pg from "pg";
import dotenv from "dotenv"; // Add dotenv to load environment variables

const db = new pg.Client({
  user: process.env.DB_USER, // Use environment variable for user
  password: process.env.DB_PASSWORD, // Use environment variable for password
  host: process.env.DB_HOST, // Use environment variable for host
  port: process.env.DB_PORT, // Use environment variable for port
  database: process.env.DB_NAME, // Use environment variable for database name
  ssl: {
    rejectUnauthorized: false, // Render requires SSL, make sure to include this
  },
});
export default db;
