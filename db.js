import pg from "pg";
const db = new pg.Pool({
  host: "ep-super-lake-a147s83m.ap-southeast-1.aws.neon.tech",
  port: 5432,
  user: "vibeZ_owner",
  password: "vpXmPV4AZa1b",
  database: "vibeZ",
  ssl: { rejectUnauthorized: false }, // SSL for Neon DB
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if a connection cannot be established
});

export default db;
